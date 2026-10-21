import importlib, sys
docs = sys.argv[1:] or ["doc1", "doc2", "doc3", "doc4", "doc5"]
for d in docs:
    m = importlib.import_module(d)
    open(f"{d}.html", "w").write(m.build())
    print("wrote", d)
