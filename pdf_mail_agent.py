
import os
import re
import time
import shutil
import logging
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv
from pypdf import PdfReader
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

import win32com.client as win32
import pythoncom

# --------------------------------------------------
# ENV / CONFIG
# --------------------------------------------------
load_dotenv()

# Alles geht an Markus

RECIPIENT_EMAIL = os.getenv("PDF_MAIL_RECIPIENT")

if not RECIPIENT_EMAIL:
    raise ValueError("PDF_MAIL_RECIPIENT ist nicht gesetzt!")


# Fallback, wenn im Dokument kein klarer Adressat erkannt wird
FALLBACK_RECIPIENT_LABEL = "Markus_Merkle"

# Eingangsordner
SOURCE_DIR = r"C:\Users\User\OneDrive - Breitband MZ GmbH\Dokumente - P O S T Markus - Dokumente\Post_Markus_Eingang"

# Archivordner
ARCHIVE_DIR = r"C:\Users\User\OneDrive - Breitband MZ GmbH\Dokumente - P O S T Markus - Dokumente\2026_Per Mail gesendet"

MAIL_BODY_TEMPLATE = """Hallo,

anbei die PDF-Datei.

Dateiname: {filename}

Viele Grüße
Automatischer PDF-Agent
"""

LOG_FILE = "pdf_mail_agent.log"
FILE_STABLE_WAIT_SECONDS = 2
FILE_STABLE_RETRIES = 10

# Schutz gegen Doppelverarbeitung derselben Datei in kurzer Zeit
PROCESSING_WINDOW_SECONDS = 60
RECENTLY_PROCESSED = {}

# --------------------------------------------------
# LOGGING
# --------------------------------------------------
logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

# --------------------------------------------------
# HILFSFUNKTIONEN
# --------------------------------------------------
def ensure_directories():
    os.makedirs(SOURCE_DIR, exist_ok=True)
    os.makedirs(ARCHIVE_DIR, exist_ok=True)


def sanitize_filename(value: str) -> str:
    value = value.strip()
    value = value.replace("\n", " ")
    value = re.sub(r"\s+", " ", value)
    value = re.sub(r'[<>:"/\\|?*]', "", value)
    value = value.strip(" ._-")
    return value[:120] if value else "Dokument"


def wait_until_file_is_stable(file_path: str) -> bool:
    last_size = -1
    for _ in range(FILE_STABLE_RETRIES):
        if not os.path.exists(file_path):
            return False

        current_size = os.path.getsize(file_path)

        if current_size == last_size and current_size > 0:
            time.sleep(FILE_STABLE_WAIT_SECONDS)
            return True

        last_size = current_size
        time.sleep(FILE_STABLE_WAIT_SECONDS)

    return False


def extract_text_from_pdf(pdf_path: str) -> str:
    try:
        reader = PdfReader(pdf_path)
        text_parts = []

        for page in reader.pages[:3]:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)

        full_text = "\n".join(text_parts).strip()

        print("🧾 Gelesener PDF-Text (erste 1000 Zeichen):")
        print(full_text[:1000])
        print("----- ENDE DEBUG TEXT -----")

        return full_text

    except Exception as e:
        logging.error(f"Fehler beim Lesen der PDF {pdf_path}: {e}")
        return ""


def detect_doc_context(pdf_path: str):
    extracted_text = extract_text_from_pdf(pdf_path)

    normalized_text = extracted_text.lower()
    normalized_text = normalized_text.replace("ö", "oe")
    normalized_text = normalized_text.replace("ä", "ae")
    normalized_text = normalized_text.replace("ü", "ue")
    normalized_text = normalized_text.replace("ß", "ss")
    normalized_text = re.sub(r"\s+", " ", normalized_text)

    doc_type = "Dokument"
    recipient_label = FALLBACK_RECIPIENT_LABEL
    sender_label = "Unbekannt"

    # Dokumenttyp
    if "grunderwerbsteuer" in normalized_text and "bescheid" in normalized_text:
        doc_type = "Bescheid_Grunderwerbsteuer"
    elif "gutschrift" in normalized_text:
        doc_type = "Gutschrift"
    elif "rechnung" in normalized_text:
        doc_type = "Rechnung"
    elif "bescheid" in normalized_text:
        doc_type = "Bescheid"
    elif "vertrag" in normalized_text:
        doc_type = "Vertrag"
    elif "kuendigung" in normalized_text:
        doc_type = "Kuendigung"
    elif "angebot" in normalized_text:
        doc_type = "Angebot"
    elif "mahnung" in normalized_text:
        doc_type = "Mahnung"
    elif "antrag" in normalized_text:
        doc_type = "Antrag"
    elif "schreiben" in normalized_text:
        doc_type = "Schreiben"
    elif "ordnungsrecht" in normalized_text:
        doc_type = "Ordnungsrecht"
    elif "kontoauszug" in normalized_text:
        doc_type = "Kontoauszug"
    elif "vertragsuebersicht" in normalized_text:
        doc_type = "Vertragsuebersicht"

    # Adressat
    if "mz neubau" in normalized_text:
        recipient_label = "MZ_NEUBAU"
    elif "mz immobilien" in normalized_text:
        recipient_label = "MZ_Immobilien"
    elif "ig ba" in normalized_text:
        recipient_label = "MZ_Immobilien"
    elif "breitband mz" in normalized_text:
        recipient_label = "Breitband_MZ"
    elif "immobilien" in normalized_text:
        recipient_label = "Immobilien"

    # Absender / Bezug
    if "finanzamt loerrach" in normalized_text:
        sender_label = "Finanzamt_Loerrach"
    elif "stadt loerrach" in normalized_text:
        sender_label = "Stadt_Loerrach"
    elif "stadt freiburg" in normalized_text:
        sender_label = "Stadt_Freiburg"
    elif "allianz" in normalized_text:
        sender_label = "Allianz"
    elif "continentale" in normalized_text:
        sender_label = "Continentale"
    elif "fachbereich ordnungsrecht" in normalized_text or "ordnungswidrig" in normalized_text:
        sender_label = "Ordnungsrecht"
    elif "canada" in normalized_text:
        sender_label = "Canada"

    # Generische Stadt-Erkennung
    if sender_label == "Unbekannt":
        city_match = re.search(r"\bstadt\s+([a-zA-Z0-9_\-]+)", normalized_text)
        if city_match:
            city_name = city_match.group(1).strip()
            sender_label = "Stadt_" + sanitize_filename(city_name.title())

    # Generische Finanzamt-Erkennung
    if sender_label == "Unbekannt":
        finanzamt_match = re.search(r"\bfinanzamt\s+([a-zA-Z0-9_\-]+)", normalized_text)
        if finanzamt_match:
            amt_name = finanzamt_match.group(1).strip()
            sender_label = "Finanzamt_" + sanitize_filename(amt_name.title())

    return doc_type, recipient_label, sender_label


def derive_meaningful_name(pdf_path: str) -> str:
    base_date = datetime.now().strftime("%Y%m%d")

    doc_type, recipient_label, sender_label = detect_doc_context(pdf_path)

    doc_type = sanitize_filename(doc_type)
    recipient_label = sanitize_filename(recipient_label)
    sender_label = sanitize_filename(sender_label)

    return f"Post_{base_date}_{doc_type}_{recipient_label}_{sender_label}.pdf"


def get_unique_path(folder: str, filename: str) -> str:
    base = Path(filename).stem
    suffix = Path(filename).suffix
    candidate = os.path.join(folder, filename)

    counter = 1
    while os.path.exists(candidate):
        candidate = os.path.join(folder, f"{base}_{counter}{suffix}")
        counter += 1

    return candidate


def was_recently_processed(pdf_path: str) -> bool:
    """
    Verhindert Doppelverarbeitung derselben Datei in kurzer Zeit
    innerhalb derselben laufenden Instanz.
    """
    now = time.time()

    expired = []
    for path, ts in RECENTLY_PROCESSED.items():
        if now - ts > PROCESSING_WINDOW_SECONDS:
            expired.append(path)

    for path in expired:
        del RECENTLY_PROCESSED[path]

    if pdf_path in RECENTLY_PROCESSED:
        return True

    RECENTLY_PROCESSED[pdf_path] = now
    return False


def send_pdf_via_outlook(pdf_path: str, recipient_email: str):
    try:
        pythoncom.CoInitialize()

        outlook = win32.Dispatch("Outlook.Application")
        mail = outlook.CreateItem(0)

        filename = os.path.basename(pdf_path)

        mail.To = recipient_email
        mail.Subject = filename
        mail.Body = MAIL_BODY_TEMPLATE.format(filename=filename)
        mail.Attachments.Add(pdf_path)

        mail.Send()

        logging.info(f"E-Mail gesendet an {recipient_email}: {filename}")
        print(f"✅ E-Mail gesendet: {filename}")

    except Exception as e:
        logging.error(f"Fehler beim Senden über Outlook: {e}")
        print(f"❌ Fehler beim Outlook Versand: {e}")
        raise

    finally:
        pythoncom.CoUninitialize()


def process_pdf(pdf_path: str):
    try:
        print(f"📄 Neue PDF erkannt: {pdf_path}")

        if was_recently_processed(pdf_path):
            print(f"⏭️ Bereits kürzlich verarbeitet, übersprungen: {pdf_path}")
            return

        if not wait_until_file_is_stable(pdf_path):
            logging.warning(f"Datei nicht stabil / übersprungen: {pdf_path}")
            print(f"⚠️ Datei noch nicht stabil: {pdf_path}")
            return

        doc_type, recipient_label, sender_label = detect_doc_context(pdf_path)
        print(f"🔎 Erkannt -> Typ: {doc_type} | Adressat: {recipient_label} | Absender: {sender_label}")

        new_filename = derive_meaningful_name(pdf_path)
        archive_target = get_unique_path(ARCHIVE_DIR, new_filename)

        shutil.copy2(pdf_path, archive_target)
        logging.info(f"PDF nach Archiv kopiert: {archive_target}")
        print(f"📁 Archiviert als: {archive_target}")

        if not os.path.exists(archive_target):
            raise FileNotFoundError(f"Archivdatei wurde nicht gefunden: {archive_target}")

        send_pdf_via_outlook(archive_target, RECIPIENT_EMAIL)

        os.remove(pdf_path)
        logging.info(f"Originaldatei entfernt: {pdf_path}")
        print(f"🗑️ Original entfernt: {os.path.basename(pdf_path)}")

    except Exception as e:
        logging.error(f"Fehler bei Verarbeitung von {pdf_path}: {e}")
        print(f"❌ Fehler bei Verarbeitung: {e}")


# --------------------------------------------------
# WATCHDOG
# --------------------------------------------------
class PDFIncomingHandler(FileSystemEventHandler):
    def on_created(self, event):
        if event.is_directory:
            return

        if event.src_path.lower().endswith(".pdf"):
            process_pdf(event.src_path)


def process_existing_pdfs():
    for filename in os.listdir(SOURCE_DIR):
        if filename.lower().endswith(".pdf"):
            full_path = os.path.join(SOURCE_DIR, filename)
            process_pdf(full_path)


def main():
    ensure_directories()

    print("🚀 PDF Mail Agent gestartet")
    print(f"📥 Eingang: {SOURCE_DIR}")
    print(f"📤 Archiv:  {ARCHIVE_DIR}")
    print(f"📧 Empfänger: {RECIPIENT_EMAIL}")

    process_existing_pdfs()

    event_handler = PDFIncomingHandler()
    observer = Observer()
    observer.schedule(event_handler, SOURCE_DIR, recursive=False)
    observer.start()

    try:
        while True:
            time.sleep(2)
    except KeyboardInterrupt:
        observer.stop()
        print("🛑 Agent gestoppt")

    observer.join()


if __name__ == "__main__":
    main()
