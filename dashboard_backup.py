"""
Streamlit Dashboard für das AI Agent Factory System.

Dieses Dashboard bietet eine einfache Web-UI zur Steuerung des Agent-Builder-Systems.
"""

import streamlit as st
from pathlib import Path
from main import AgentFactorySystem
from config import OUTPUT_DIR, BEST_AGENT_DIR
import json
from datetime import datetime

# ============================================================================
# STREAMLIT CONFIGURATION
# ============================================================================

st.set_page_config(
    page_title="AI Agent Factory Dashboard",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ============================================================================
# CUSTOM STYLING
# ============================================================================


st.markdown(
    """
    <style>
    .stApp {
        background-color: #111827;
        color: white;
    }
    
section[data-testid="stSidebar"] {
    background: linear-gradient(180deg, #334155 0%, #1e293b 100%);
    color: white;
    border-right: 1px solid #374151;

section[data-testid="stSidebar"] h1,
section[data-testid="stSidebar"] h2,
section[data-testid="stSidebar"] h3 {
    color: white;
}

section[data-testid="stSidebar"] p {
    color: #cbd5e1;
}

textarea {
    background-color: #1f2937 !important;
    color: white !important;
    border: 1px solid #374151 !important;
    border-radius: 8px !important;
}
    

div[data-testid="stMetric"] {
    background-color: #1f2937;
    padding: 10px;
    border-radius: 8px;
}

    .main-header {
        text-align: center;
        padding: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 10px;
        color: white;
        margin-bottom: 20px;
    }

    .status-box {
        padding: 15px;
        border-radius: 8px;
        margin: 10px 0;
        border-left: 4px solid;
    }

    .status-planning {
        background-color: #1e2a38;
        border-left-color: #2196f3;
    }

    .status-coding {
        background-color: #2a1e38;
        border-left-color: #9c27b0;
    }

    .status-completed {
        background-color: #1e3822;
        border-left-color: #4caf50;
    }

    .status-failed {
        background-color: #381e1e;
        border-left-color: #f44336;
    }

    .code-box {
        background-color: #1a1a1a;
        padding: 15px;
        border-radius: 8px;
        font-family: monospace;
        overflow-x: auto;
    }
    
    
button {
    background: #374151 !important;
    color: white !important;
    border-radius: 8px !important;
    border: 1px solid #4b5563 !important;
}

button:hover {
    background: #4b5563 !important;
}



div[data-testid="stTextInput"],
div[data-testid="stTextArea"],
div[data-testid="stDownloadButton"],
div[data-testid="stButton"] {
    background-color: transparent !important;
}



div[data-testid="stHorizontalBlock"] {
    

background-color: #374151;
    padding: 20px;
    border-radius: 12px;
    border: 1px solid #374151;
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

hr {
    border: 1px solid #1f2937;
}

textarea, input {
    background-color: #111827 !important;
    color: white !important;
    border: 1px solid #374151 !important;
    border-radius: 8px !important;
}

p, span {
    color: #e2e8f0;
}

textarea {
    background-color: #1f2937 !important;
    color: white !important;
    border: 1px solid #374151 !important;
}

button {
    background-color: #374151 !important;
    color: white !important;
}

h1, h2, h3 {
    color: #f9fafb;
}


label {
    color: #f9fafb !important;
}

label, small {
    color: #e5e7eb !important;
}


div[data-testid="stMetric"] {
    background-color: #374151;
    padding: 10px;
    border-radius: 10px;
}

div[data-testid="stTextArea"] label {
    color: #f1f5f9 !important;
    font-weight: 500 !important;
}

    </style>
    """,
    unsafe_allow_html=True,
)

# ============================================================================
# SESSION STATE INITIALIZATION
# ============================================================================

if "agent_factory" not in st.session_state:
    st.session_state.agent_factory = AgentFactorySystem()

if "running" not in st.session_state:
    st.session_state.running = False

if "last_result" not in st.session_state:
    st.session_state.last_result = None

if "task_history" not in st.session_state:
    st.session_state.task_history = []

# ============================================================================
# MAIN UI
# ============================================================================

# Header
st.markdown(
    "<div class='main-header'><h1>🤖 AI Agent Factory Dashboard</h1>"
    "<p>Automatische Generierung und Optimierung von Agenten</p></div>",
    unsafe_allow_html=True,
)

# Sidebar Configuration
with st.sidebar:
    st.header("⚙️ Einstellungen")
    
    st.subheader("System Status")
    col1, col2 = st.columns(2)
    with col1:
        agents_dir = Path(OUTPUT_DIR)
        agent_count = len(list(agents_dir.glob("agent_*.py"))) if agents_dir.exists() else 0
        st.metric("Generierte Agenten", agent_count)
    
    with col2:
        best_agent_path = Path(BEST_AGENT_DIR) / "best_agent.py"
        has_best = "✓" if best_agent_path.exists() else "✗"
        st.metric("Bester Agent", has_best)
    
    st.divider()
    
    st.subheader("Über")
    st.write(
        """
        Dieses System generiert automatisch mehrere Varianten eines Agenten,
        bewertet diese und wählt die beste Lösung aus.
        
        **Features:**
        - 🧠 LLM-gesteuerte Codegeneration
        - 🔄 Iterative Verbesserung
        - 🚀 Automatische Ausführung
        - 📊 Bewertung und Ranking
        """
    )

# Main Content
col1, col2 = st.columns([2, 1], gap="large")

with col1:
    st.header("📝 Agent erstellen")
    
    task_input = st.text_area(
        "Beschreibe deine Agent-Anfrage:",
        placeholder="z.B. 'Baue einen Trading Bot für Bitcoin' oder 'Erstelle einen News-Scraper'",
        height=100,
        key="task_input",
    )
    
    col_btn1, col_btn2, col_btn3 = st.columns(3)
    with col_btn1:
        create_button = st.button("🚀 Agent erstellen", use_container_width=True)
    
    with col_btn2:
        clear_button = st.button("🗑️ Löschen", use_container_width=True)
    
    with col_btn3:
        refresh_button = st.button("🔄 Aktualisieren", use_container_width=True)
    
    if clear_button:
        st.session_state.task_input = ""
        st.rerun()
    
    if refresh_button:
        st.rerun()
    
    # Process Button Click
    if create_button and task_input.strip():
        with st.spinner("🔄 Agent wird generiert... Dies kann einige Minuten dauern."):
            try:
                result = st.session_state.agent_factory.run(task_input.strip())
                st.session_state.last_result = result
                st.session_state.task_history.append(
                    {
                        "task": task_input.strip(),
                        "timestamp": datetime.now().isoformat(),
                        "status": result.status.value,
                        "filename": result.final_filename,
                    }
                )
                st.success("✅ Agent erfolgreich generiert!")
            except Exception as e:
                st.error(f"❌ Fehler bei der Generierung: {str(e)}")
    elif create_button:
        st.warning("⚠️ Bitte gib eine Aufgabe ein!")

with col2:
    st.header("📊 Generierte Agenten")
    
    agents_dir = Path(OUTPUT_DIR)
    if agents_dir.exists():
        agent_files = sorted(agents_dir.glob("agent_v*.py"))
        if agent_files:
            st.write(f"**{len(agent_files)} Varianten verfügbar**")
            for agent_file in agent_files:
                size = agent_file.stat().st_size
                st.write(f"• `{agent_file.name}` ({size} bytes)")
        else:
            st.info("Noch keine Agenten generiert.")
    else:
        st.info("Generiert noch keinen Agent.")

# Results Display
if st.session_state.last_result:
    st.divider()
    st.header("🎯 Ergebnisse")
    
    result = st.session_state.last_result
    
    # Status Section
    status_class_map = {
        "planning": "status-planning",
        "coding": "status-coding",
        "completed": "status-completed",
        "failed": "status-failed",
    }
    status_class = status_class_map.get(result.status.value, "status-planning")
    
    st.markdown(
        f"<div class='status-box {status_class}'>"
        f"<b>Status:</b> {result.status.value.upper()}</div>",
        unsafe_allow_html=True,
    )
    
    # Metrics
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("Iterationen", result.iteration_count)
    with col2:
        score = f"{result.final_quality_score:.1f}/10" if result.final_quality_score else "N/A"
        st.metric("Quality Score", score)
    with col3:
        st.metric("Ausführungen", result.execution_attempts)
    with col4:
        exec_status = "✓ Erfolgreich" if result.execution_success else "✗ Fehlgeschlagen"
        st.metric("Ausführung", exec_status)
    
    # Best Variant Section
    if result.best_variant:
        st.subheader("🏆 Beste Variante")
        best = result.best_variant
        
        col1, col2, col3 = st.columns(3)
        with col1:
            st.write(f"**Variante:** {best.get('variant_name', 'N/A')}")
        with col2:
            st.write(f"**Label:** {best.get('label', 'N/A')}")
        with col3:
            st.write(f"**Score:** {best.get('score', 'N/A')}")
    
    # Tabs for detailed view
    tab1, tab2, tab3, tab4 = st.tabs(
        ["📋 Plan", "💻 Code", "🚀 Ausführung", "📊 Varianten"]
    )
    
    with tab1:
        st.subheader("Plan Details")
        if result.plan:
            col1, col2 = st.columns(2)
            with col1:
                st.write(f"**Agent Name:** {result.plan.agent_name}")
                st.write(f"**Komplexität:** {result.plan.estimated_complexity}")
            with col2:
                st.write(f"**Beschreibung:** {result.plan.agent_description}")
            
            st.write("**Plan Schritte:**")
            for step in result.plan.plan_steps:
                with st.expander(f"Schritt {step.step_number}: {step.title}"):
                    st.write(step.description)
                    st.write(f"*{step.implementation_notes}*")
        else:
            st.info("Kein Plan verfügbar.")
    
    with tab2:
        st.subheader("Generierter Code")
        if result.final_code:
            st.code(result.final_code, language="python")
            
            col1, col2 = st.columns(2)
            with col1:
                st.write(f"**Zeilen:** {len(result.final_code.splitlines())}")
            with col2:
                st.write(f"**Größe:** {len(result.final_code)} bytes")
            
            if result.final_filename:
                st.write(f"**Datei:** `{Path(result.final_filename).name}`")
        else:
            st.info("Kein Code verfügbar.")
    
    with tab3:
        st.subheader("Ausführungs-Ergebnisse")
        
        col1, col2 = st.columns(2)
        with col1:
            st.write(f"**Status:** {'✓ Erfolgreich' if result.execution_success else '✗ Fehlgeschlagen'}")
            st.write(f"**Versuche:** {result.execution_attempts}")
        with col2:
            if result.execution_error:
                st.write(f"**Fehler:** {result.execution_error[:200]}")
        
        if result.execution_result:
            st.write("**Output:**")
            st.code(result.execution_result[:1000], language="text")
            if len(result.execution_result) > 1000:
                st.info(f"Output gekürzt (Total: {len(result.execution_result)} Zeichen)")
    
    with tab4:
        st.subheader("Varianten-Ranking")
        if result.variant_results:
            variants_data = []
            for variant in result.variant_results:
                variants_data.append(
                    {
                        "Variante": variant.get("variant_name", "N/A"),
                        "Label": variant.get("label", "N/A"),
                        "Score": f"{variant.get('score', 0):.2f}",
                        "Erfolgreich": "✓" if variant.get("execution_success") else "✗",
                    }
                )
            st.dataframe(variants_data, use_container_width=True)
        else:
            st.info("Keine Varianten verfügbar.")
    
    # Errors
    if result.errors:
        st.divider()
        st.warning("⚠️ Fehler während der Verarbeitung:")
        for error in result.errors:
            st.write(f"• {error}")

# History Section
st.divider()
with st.expander("📜 Task-Verlauf", expanded=False):
    if st.session_state.task_history:
        history_data = []
        for entry in reversed(st.session_state.task_history):
            history_data.append(
                {
                    "Zeit": entry["timestamp"][:19],
                    "Aufgabe": entry["task"][:50],
                    "Status": entry["status"],
                    "Datei": Path(entry["filename"]).name if entry["filename"] else "N/A",
                }
            )
        st.dataframe(history_data, use_container_width=True)
    else:
        st.info("Noch keine Tasks verarbeitet.")

# Best Agent Section
st.divider()
st.header("🏆 Bester Agent")

best_agent_path = Path(BEST_AGENT_DIR) / "best_agent.py"
best_metadata_path = Path(BEST_AGENT_DIR) / "best_agent_metadata.txt"

if best_agent_path.exists():
    col1, col2 = st.columns([2, 1])
    with col1:
        st.success("✓ Ein bester Agent existiert!")
        
        if best_metadata_path.exists():
            metadata = best_metadata_path.read_text(encoding="utf-8")
            st.write("**Metadaten:**")
            st.code(metadata, language="text")
        
        best_code = best_agent_path.read_text(encoding="utf-8")
        with st.expander("📄 Code anzeigen"):
            st.code(best_code, language="python")
    
    with col2:
        if st.button("▶️ Starten", key="run_best_agent", use_container_width=True):
            st.info(f"🚀 Bester Agent würde gestartet werden: `{best_agent_path}`")
        
        if st.button("💾 Herunterladen", key="download_best_agent", use_container_width=True):
            st.download_button(
                label="Download best_agent.py",
                data=best_code,
                file_name="best_agent.py",
                mime="text/plain",
            )
else:
    st.info("🔍 Noch kein bester Agent generiert. Erstelle einen Agent, um den besten zu speichern.")

# Footer
st.divider()
st.markdown(
    """
    ---
    **AI Agent Factory Dashboard** v1.0 | Powered by Streamlit
    
    [GitHub](https://github.com) • [Dokumentation](https://docs.streamlit.io)
    """,
    unsafe_allow_html=True,
)
