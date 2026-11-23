"""Ask a local model through AirLLM: python ask.py [--model REPO_OR_PATH] [--max-new-tokens N] "prompt".

Runs entirely on this machine (layer-by-layer from disk). The first run downloads the model from Hugging Face and
splits it into per-layer files under ~/airllm/layers; later runs reuse them. Answers are drafts like any other seat's:
never a rate quote, an eligibility call or a send to a client (CLAUDE.md HALT).
"""
import argparse
import os
import sys


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("prompt")
    ap.add_argument("--model", default=os.environ.get("AIRLLM_MODEL", "TinyLlama/TinyLlama-1.1B-Chat-v1.0"))
    ap.add_argument("--max-new-tokens", type=int, default=64)
    ap.add_argument("--max-length", type=int, default=512)
    ap.add_argument("--layers-dir", default=os.path.expanduser(os.environ.get("AIRLLM_LAYERS", "~/airllm/layers")))
    a = ap.parse_args(argv)
    try:
        from airllm import AutoModel
    except ImportError:
        print("ask.py: airllm is not installed here — run: bash integrations/airllm/install.sh", file=sys.stderr)
        return 1
    os.makedirs(a.layers_dir, exist_ok=True)
    model = AutoModel.from_pretrained(a.model, layer_shards_saving_path=a.layers_dir)
    toks = model.tokenizer([a.prompt], return_tensors="pt", return_attention_mask=False,
                           truncation=True, max_length=a.max_length, padding=False)
    out = model.generate(toks["input_ids"].to(model.device), max_new_tokens=a.max_new_tokens,
                         use_cache=True, return_dict_in_generate=True)
    print(model.tokenizer.decode(out.sequences[0], skip_special_tokens=True))
    return 0


if __name__ == "__main__":
    sys.exit(main())
