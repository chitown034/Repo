import importlib.util
import json
import os
import tempfile
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("anydesk_links", HERE / "anydesk-links.py")
al = importlib.util.module_from_spec(spec)
spec.loader.exec_module(al)


def write(tmp, obj):
    p = Path(tmp) / "devices.json"
    p.write_text(json.dumps(obj) if not isinstance(obj, str) else obj, encoding="utf-8")
    return p


class IdTests(unittest.TestCase):
    def test_spaced_and_plain_ids(self):
        self.assertEqual(al.make_link("123 456 789"), "anydesk:123456789")
        self.assertEqual(al.make_link("1234567890"), "anydesk:1234567890")

    def test_rejects_non_digits(self):
        for bad in ["12a 456 789", "123-456-789", "123456789; calc", "me@ad", "", "١٢٣٤٥٦٧٨٩", "anydesk:123456789"]:
            with self.assertRaises(al.LinkError, msg=bad):
                al.make_link(bad)

    def test_rejects_wrong_length_and_types(self):
        for bad in ["12345678", "12345678901", 123456789, None]:
            with self.assertRaises(al.LinkError):
                al.make_link(bad)

    def test_link_shape_is_fixed(self):
        self.assertRegex(al.make_link("000 000 000"), r"^anydesk:[0-9]{9}$")


class FileTests(unittest.TestCase):
    def test_example_file_loads(self):
        d = al.load_devices(HERE / "devices.example.json")
        self.assertEqual([x["label"] for x in d], ["Mac 1", "Mac 2", "Alienware", "iPad", "Phone"])
        self.assertTrue(all(x["id"].startswith("000 000") for x in d))

    def test_refuses_secret_keys_anywhere(self):
        for key in ["password", "Password", "pwd", "secret", "unattended_password", "api_token"]:
            with tempfile.TemporaryDirectory() as t:
                top = write(t, {"devices": [{"label": "A", "id": "123 456 789"}], key: "x"})
                with self.assertRaises(al.LinkError, msg=key):
                    al.load_devices(top)
                nested = write(t, {"devices": [{"label": "A", "id": "123 456 789", key: "x"}]})
                with self.assertRaises(al.LinkError, msg=key):
                    al.load_devices(nested)

    def test_refusal_does_not_echo_the_secret_value(self):
        with tempfile.TemporaryDirectory() as t:
            p = write(t, {"devices": [{"label": "A", "id": "123 456 789", "password": "hunter2hunter2"}]})
            try:
                al.load_devices(p)
            except al.LinkError as exc:
                self.assertNotIn("hunter2", str(exc))

    def test_unknown_device_keys_rejected(self):
        with tempfile.TemporaryDirectory() as t:
            p = write(t, {"devices": [{"label": "A", "id": "123 456 789", "notes": "x"}]})
            with self.assertRaises(al.LinkError):
                al.load_devices(p)

    def test_bad_id_in_file_rejected(self):
        with tempfile.TemporaryDirectory() as t:
            p = write(t, {"devices": [{"label": "A", "id": "123 456 78x"}]})
            with self.assertRaises(al.LinkError):
                al.load_devices(p)

    def test_duplicate_labels_and_bad_json(self):
        with tempfile.TemporaryDirectory() as t:
            p = write(t, {"devices": [{"label": "A", "id": "123 456 789"}, {"label": "a", "id": "123 456 780"}]})
            with self.assertRaises(al.LinkError):
                al.load_devices(p)
            with self.assertRaises(al.LinkError):
                al.load_devices(write(t, "{not json"))

    def test_missing_file_message(self):
        with tempfile.TemporaryDirectory() as t:
            with self.assertRaises(al.LinkError):
                al.load_devices(Path(t) / "nope.json")

    def test_refuses_real_file_inside_repo(self):
        repo = al.repo_root_of(HERE)
        if repo is None:
            self.skipTest("not in a git checkout")
        with self.assertRaises(al.LinkError):
            al.refuse_if_in_repo(HERE / "devices.json")


class OutputTests(unittest.TestCase):
    def setUp(self):
        self.devs = al.load_devices(HERE / "devices.example.json")

    def test_table_and_links(self):
        t = al.render_table(self.devs)
        self.assertIn("| Mac 1 | 000 000 000 | `anydesk:000000000` |", t)
        self.assertIn("anydesk:000000002", al.render_links(self.devs))

    def test_json_blob_has_only_labels_ids_links(self):
        blob = json.loads(al.render_json(self.devs))
        self.assertEqual(blob["kind"], "anydeskLinks")
        for d in blob["devices"]:
            self.assertEqual(set(d), {"label", "id", "link"})
        text = al.render_json(self.devs).lower()
        for word in ("password", "pwd", "secret"):
            self.assertNotIn(word, text)

    def test_open_dry_run_and_unknown_label(self):
        self.assertEqual(al.open_link(self.devs, "alienware", dry_run=True), "DRY-RUN would open anydesk:000000002")
        with self.assertRaises(al.LinkError):
            al.open_link(self.devs, "Nope", dry_run=True)

    def test_label_cleaning_and_pipe_escape(self):
        self.assertEqual(al.clean_label("Mac | 1<script>"), "Mac 1script")
        with self.assertRaises(al.LinkError):
            al.clean_label("<<>>")


class CliTests(unittest.TestCase):
    def test_main_ok_and_error_codes(self):
        self.assertEqual(al.main(["table", "--file", str(HERE / "devices.example.json")]), 0)
        with tempfile.TemporaryDirectory() as t:
            p = write(t, {"devices": [], "password": "x"})
            self.assertEqual(al.main(["links", "--file", str(p)]), 2)


if __name__ == "__main__":
    unittest.main()
