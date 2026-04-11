# Flowdesk Full

Aqui quedaria el frontend y el backend unificados, no deberiamos trabajar directamente en este repo, mas bien en los sub-repos pero para funcionamientos finales, seria de verlo desde este repo para que corra backend y frontend en conjunto

## Para clonar con referencias a repo de frt y de bck

```bash
git clone --recurse-submodules https://github.com/yehosuah/flowdesk-full.git
```

Si ya clonaron, pero quieren hacer pulls de ambos repos (frt y bck):

```bash
git submodule update --init --recursive
```
