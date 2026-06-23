import os
from pathlib import Path
from datetime import datetime
import streamlit as st

ARCHIVE_DIR = r"C:\Users\User\OneDrive - Breitband MZ GmbH\Dokumente - P O S T Markus - Dokumente\2026_Per Mail gesendet"
SOURCE_DIR = r"C:\Users\User\OneDrive - Breitband MZ GmbH\Dokumente - P O S T Markus - Dokumente\Post_Markus_Eingang"
LOG_FILE = r"C:\Users\User\ai-assistant\agent_creator\pdf_mail_agent.log"

st.set_page_config(page_title="PDF Post Dashboard", layout="wide")
st.title("📄 PDF Post Dashboard")

# Helper

def list_pdfs(folder: str):
    items = []
    if not os.path.exists(folder):
        return items
    for root, dirs, files in os.walk(folder):
        for f in files:
            if f.lower().endswith('.pdf'):
                full = os.path.join(root, f)
                stat = os.stat(full)
                items.append({
                    'name': f,
                    'path': full,
                    'modified': datetime.fromtimestamp(stat.st_mtime),
                    'size_kb': round(stat.st_size / 1024, 1),
                })
    items.sort(key=lambda x: x['modified'], reverse=True)
    return items

source_pdfs = list_pdfs(SOURCE_DIR)
archive_pdfs = list_pdfs(ARCHIVE_DIR)

col1, col2, col3 = st.columns(3)
col1.metric('📥 Eingang', len(source_pdfs))
col2.metric('📤 Archiviert', len(archive_pdfs))
col3.metric('🕒 Jetzt', datetime.now().strftime('%H:%M:%S'))

st.subheader('📂 Letzte archivierte PDFs')
if archive_pdfs:
    for item in archive_pdfs[:15]:
        st.write(f"**{item['name']}**")
        st.caption(f"{item['modified'].strftime('%d.%m.%Y %H:%M:%S')} | {item['size_kb']} KB")
        st.code(item['path'])
else:
    st.info('Noch keine archivierten PDFs gefunden.')

st.subheader('📥 PDFs im Eingang')
if source_pdfs:
    for item in source_pdfs[:15]:
        st.write(f"**{item['name']}**")
        st.caption(f"{item['modified'].strftime('%d.%m.%Y %H:%M:%S')} | {item['size_kb']} KB")
else:
    st.success('Kein Rückstand im Eingangsordner.')

st.subheader('📝 Letzte Log-Einträge')
if os.path.exists(LOG_FILE):
    with open(LOG_FILE, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()
    last_lines = ''.join(lines[-40:])
    st.text(last_lines)
else:
    st.info('Noch keine Log-Datei gefunden.')

if st.button('🔄 Aktualisieren'):
    st.rerun()
