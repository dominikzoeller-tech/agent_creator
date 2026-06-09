"""
Evaluationsmodul für generierte Agents.

Bewertet Code anhand von Struktur, Lesbarkeit, Fehlerfreiheit und Ausführung.
"""

import ast
import re
from typing import Optional


def score_code_structure(code: str) -> float:
    """Bewertet die Struktur des Codes."""
    try:
        tree = ast.parse(code)
    except SyntaxError:
        return 0.0

    score = 0.0
    functions = sum(isinstance(node, ast.FunctionDef) for node in tree.body)
    classes = sum(isinstance(node, ast.ClassDef) for node in tree.body)
    imports = sum(isinstance(node, ast.Import) or isinstance(node, ast.ImportFrom) for node in tree.body)

    score += min(functions * 5, 25)
    score += min(classes * 7, 25)
    score += min(imports * 5, 20)

    return min(score, 70.0)


def score_readability(code: str) -> float:
    """Bewertet Lesbarkeit anhand von Kommentaren, Docstrings und Zeilenlänge."""
    lines = code.splitlines()
    if not lines:
        return 0.0

    comment_density = sum(1 for line in lines if line.strip().startswith("#")) / len(lines)
    docstring_count = len(re.findall(r"\"\"\"|\'\'\'", code))
    long_lines = sum(1 for line in lines if len(line) > 120)

    score = 0.0
    score += min(comment_density * 100, 25)
    score += min(docstring_count * 5, 25)
    score += max(0, 25 - long_lines)

    return min(score, 75.0)


def score_execution(success: bool, output: str) -> float:
    """Bewertet die Ausführung und ob Output produziert wurde."""
    if not success:
        return 0.0

    output_score = 20.0 if output and output.strip() else 10.0
    return min(40.0, output_score)


def evaluate_agent(code: str, execution_success: bool, execution_output: str) -> float:
    """Berechnet den Gesamtscore für einen Agenten."""
    structure_score = score_code_structure(code)
    readability_score = score_readability(code)
    execution_score = score_execution(execution_success, execution_output)

    total_score = structure_score * 0.4 + readability_score * 0.3 + execution_score * 0.3
    return round(min(total_score, 100.0), 2)


def rank_variants(variants: list[dict]) -> list[dict]:
    """Sortiert Variants nach Score und Fehlerfreiheit."""
    return sorted(
        variants,
        key=lambda item: (
            item.get("evaluation_score", 0),
            1 if item.get("execution_success") else 0,
        ),
        reverse=True,
    )
