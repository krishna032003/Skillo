import py_compile
import glob
import os

files_to_compile = [
    "backend/main.py",
    "backend/config.py",
    "backend/seed.py"
]

files_to_compile.extend(glob.glob("backend/agents/*.py"))
files_to_compile.extend(glob.glob("backend/routers/*.py"))
files_to_compile.extend(glob.glob("backend/models/*.py"))

success = True
for f in files_to_compile:
    try:
        py_compile.compile(f, doraise=True)
        print(f"Compiled: {f}")
    except py_compile.PyCompileError as e:
        print(f"FAILED: {f}\n{e}")
        success = False

if not success:
    exit(1)
