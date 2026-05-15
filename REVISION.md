# 🔧 Codewarts FSL Translator — Revision Plan

> **Audit date:** May 15, 2026  
> **Scope:** Runtime reliability, UI/UX modernization, code quality, documentation

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Category A — Runtime & Environment (Why "some of us can't run it")](#category-a--runtime--environment)
3. [Category B — UI/Frontend Modernization](#category-b--uifrontend-modernization)
4. [Category C — Code Quality & Architecture](#category-c--code-quality--architecture)
5. [Category D — Documentation Cleanup](#category-d--documentation-cleanup)
6. [Prioritized Roadmap](#prioritized-roadmap)

---

## Executive Summary

The repository has two classes of problems:

| Problem | Root Cause | Impact |
|---------|------------|--------|
| **Inconsistent running** | No pinned Python version, conflicting `requirements.txt` files, no venv activation in `.bat`, no cross-platform launcher | Team members can't run the app |
| **Dated UI** | Built with raw Tkinter (no CSS, no responsiveness, no modern toolkit) | Looks like a 2010-era desktop utility |

This document provides a **concrete, file-by-file list of improvements** for both.

---

## Category A — Runtime & Environment

These are the fixes that directly solve *"some of us can't run it."*

---

### A1. 🔴 CRITICAL — Python Version Not Pinned

**Problem:**  
- README.md says `Python 3.9+`  
- APP_README.md says `Python 3.8+`
- The repo's own `venv/` was created with an unspecified version  
- System Python on this machine is **3.14**, which has known TensorFlow/MediaPipe incompatibilities  
- TensorFlow currently only officially supports up to Python **3.12**

**Fix:**  
- Pin Python to **3.11** (the sweet spot for TensorFlow + MediaPipe compatibility)
- Add a `.python-version` file so tools like `pyenv` and `py` launcher respect it
- Update README to state the exact version required

---

### A2. 🔴 CRITICAL — Three Conflicting Requirements Files

**Problem:**  
The repo has **three** different requirements files that contradict each other. A new team member running `pip install -r requirements.txt` gets **mediapipe 0.9.1.0**, but the app itself expects **>=0.10.0** features. Running the app after this install will crash.

**Fix:**  
- Consolidate into a **single** `requirements.txt` at the root with fully pinned versions.
- Delete `app_requirements.txt` (merge into root).
- Keep `video-processing/requirements.txt` only if that subfolder is used independently; otherwise delete it.

---

### A3. 🔴 CRITICAL — `.bat` Scripts Don't Activate the Virtual Environment

**Problem:**  
Both `run_app.bat` and `run_app_v2.bat` call bare `python`, which resolves to the system Python (3.14) instead of the `venv/`.

**Fix:**  
- Update batch files to call `venv\Scripts\activate.bat` before launching the script.

---

### A4. 🟡 HIGH — No Cross-Platform Launcher

**Problem:**  
Only `.bat` files exist. macOS/Linux team members have no launcher at all.

**Fix:**  
Add a cross-platform Python launcher `run.py`.

---

### A5. 🟡 HIGH — `.gitignore` Is Nearly Empty

**Problem:**  
Current `.gitignore` does **not** ignore `venv/`, `__pycache__/`, `.DS_Store`, or `.h5` model files.

**Fix:**  
Update `.gitignore` to cover all standard Python development artifacts.

---

### A6. 🟡 HIGH — No Setup / Bootstrap Script

**Problem:**  
There is no single command a new contributor can run to get from `git clone` to a working app.

**Fix:**  
Add `setup.bat` for one-shot environment setup.

---

### A7. 🟢 MEDIUM — Model Architecture Defined in Code Instead of Saved Model

**Problem:**  
The model architecture is rebuilt from scratch in the app files. If anyone changes the architecture in training without updating the app, it breaks.

**Fix:**  
- Save the **full model** (architecture + weights) as a `.keras` or SavedModel format.

---

## Category B — UI/Frontend Modernization

These are the changes to make the app look **modern, sleek, and minimalistic**.

---

### B1. 🔴 CRITICAL — Migrate from Tkinter to a Web-Based Frontend

**Current state:**  
The entire UI is built with raw Tkinter. It looks like a 2010-era utility.

**Recommended architecture:**
- **Backend:** Python (FastAPI) for ML inference.
- **Frontend:** Next.js (React) for a modern, responsive interface.

---

### B2. 🔴 CRITICAL — Design System Overhaul

**Recommended modern design tokens:**
- **Background:** Deep rich dark with subtle blue (`#0a0a0f`).
- **Surface:** Glassmorphism (blur + semi-transparent white).
- **Primary:** Indigo gradient (`#6366f1` → `#818cf8`).
- **Typography:** Modern fonts like `Inter` or `Plus Jakarta Sans`.

---

### B3. 🟡 HIGH — Specific Component Redesigns

- **Camera Feed:** Rounded borders, semi-transparent overlays.
- **Detected Signs:** Animated chips/pills that slide in.
- **Translation:** Large, centered text with typewriter animation.
- **Buttons:** Gradients, hover effects, and ripples.

---

### B4. 🟡 HIGH — Remove Visual Clutter

- Move debug utilities into a collapsible Settings drawer.
- Focus the main interface on just **Start/Stop** and **Clear**.

---

## Category C — Code Quality & Architecture

---

### C1. 🟡 HIGH — Eliminate Near-Duplicate App Files

**Problem:**  
`fsl_translator_app.py` and `fsl_translator_app_v2.py` are nearly identical.

**Fix:**  
- Merge into a single app with a CLI argument for the model file.

---

### C2. 🟡 HIGH — Separate Concerns (MVC)

**Fix:**  
- Refactor the code into modular folders (`src/processing`, `src/models`, etc.) instead of one giant 600-line class.

---

## Category D — Documentation Cleanup

---

### D1. 🟡 HIGH — Consolidate Redundant Documentation

**Problem:**  
Several docs still reference **Gemma AI** as an active requirement when it was recently removed.

**Fix:**  
- Update docs to mark Gemma AI as a **planned future feature**.
- Merge redundant READMEs into a single root `README.md`.

---

## Prioritized Roadmap

### 🚨 Phase 1 — "Everyone can run it" (DONE)
- [x] Pin Python 3.11
- [x] Consolidate `requirements.txt`
- [x] Fix `.bat` scripts
- [x] Update `.gitignore`
- [x] Add `setup.bat`
- [x] Fix hardcoded paths

### 🎨 Phase 2 — "It looks modern" (Upcoming)
- [ ] Migrate to FastAPI + Next.js
- [ ] Implement new Design System
- [ ] Add micro-animations
- [ ] Make layout responsive

### 🏗️ Phase 3 — "It's well-engineered" (Upcoming)
- [ ] Merge duplicate app files
- [ ] Refactor to MVC
- [ ] Add camera selection logic
