"""
Code Executor für das AI Agent Builder System.

Dieses Modul führt generierten Python-Code isoliert aus und
liefert stdout/stderr zusammen mit einem Erfolgsindikator.
"""

import subprocess
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path


@dataclass
class ExecutionResult:
    success: bool
    output: str
    error: str = ""
    timeout: bool = False
    log_path: str = ""


def execute_python_code(code: str, timeout: int = 15, log_path: str = "") -> ExecutionResult:
    """Führt Python-Code in einem temporären Skript aus."""
    with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False, encoding="utf-8") as tmp_file:
        tmp_file.write(code)
        tmp_filename = tmp_file.name

    try:
        completed = subprocess.run(
            [sys.executable, tmp_filename],
            capture_output=True,
            text=True,
            timeout=timeout,
        )

        stdout = completed.stdout.strip()
        stderr = completed.stderr.strip()
        output = stdout
        if stderr:
            output = f"{output}\n{stderr}" if output else stderr

        if log_path:
            Path(log_path).write_text(
                f"RETURN CODE: {completed.returncode}\n\nSTDOUT:\n{stdout}\n\nSTDERR:\n{stderr}",
                encoding="utf-8",
            )

        return ExecutionResult(
            success=completed.returncode == 0,
            output=output,
            error=stderr,
            timeout=False,
            log_path=log_path,
        )

    except subprocess.TimeoutExpired as exc:
        stdout = (exc.stdout or "").strip()
        stderr = (exc.stderr or "").strip()
        output = stdout
        if stderr:
            output = f"{output}\n{stderr}" if output else stderr
        message = f"Ausführung nach {timeout}s abgebrochen."
        combined = f"{message}\n{output}" if output else message
        if log_path:
            Path(log_path).write_text(
                f"TIMEOUT: {message}\n\nSTDOUT:\n{stdout}\n\nSTDERR:\n{stderr}",
                encoding="utf-8",
            )
        return ExecutionResult(success=False, output=combined, error=message, timeout=True, log_path=log_path)

    except Exception as exc:
        output_text = str(exc)
        if log_path:
            Path(log_path).write_text(output_text, encoding="utf-8")
        return ExecutionResult(success=False, output="", error=output_text, timeout=False, log_path=log_path)

    finally:
        try:
            import os
            os.remove(tmp_filename)
        except OSError:
            pass
