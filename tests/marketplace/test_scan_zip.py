"""Static ZIP policies: no secrets, malware engine or R2 connection required."""
import importlib.util
import io
from pathlib import Path
import tempfile
import unittest
import zipfile

scanner_path=Path(__file__).resolve().parents[2]/"scripts/marketplace/scan-private-zip.py"
spec=importlib.util.spec_from_file_location("marketplace_scanner",scanner_path)
scanner=importlib.util.module_from_spec(spec)
spec.loader.exec_module(scanner)

def make(entries):
    buffer=io.BytesIO()
    with zipfile.ZipFile(buffer,"w",zipfile.ZIP_DEFLATED) as archive:
        for name,payload in entries:
            archive.writestr(name,payload)
    return buffer.getvalue()

class MarketScannerPolicyTest(unittest.TestCase):
    def inspect(self,data):
        with tempfile.TemporaryDirectory() as folder:
            return scanner.inspect_zip(data,Path(folder))[1]
    def test_valid_source_zip(self):
        x=self.inspect(make([("source/robot.mq5",b"// code"),("docs/readme.txt",b"guide")]))
        self.assertEqual(x["files"],2)
    def test_opaque_secret_keys_do_not_use_bearer(self):
        source=Path(scanner_path).read_text()
        self.assertIn('if not secret.startswith("sb_secret_"):',source)
        self.assertIn('headers["Authorization"] = "Bearer " + secret',source)

    def test_reject_traversal(self):
        with self.assertRaisesRegex(ValueError,"UNSAFE_ZIP_PATH"):
            self.inspect(make([("../escape.txt",b"bad")]))
    def test_reject_absolute_path(self):
        with self.assertRaisesRegex(ValueError,"UNSAFE_ZIP_PATH"):
            self.inspect(make([("/etc/passwd",b"bad")]))
    def test_reject_casefold_duplicates(self):
        with self.assertRaisesRegex(ValueError,"DUPLICATE_ZIP_PATH"):
            self.inspect(make([("SRC/FILE.MQ5",b"1"),("src/file.mq5",b"2")]))
    def test_reject_empty_zip(self):
        with self.assertRaisesRegex(ValueError,"EMPTY_ZIP"):
            self.inspect(make([]))
    def test_reject_symlink(self):
        buf=io.BytesIO()
        with zipfile.ZipFile(buf,"w") as z:
            info=zipfile.ZipInfo("link")
            info.create_system=3
            info.external_attr=0o120777<<16
            z.writestr(info,"/etc/passwd")
        with self.assertRaisesRegex(ValueError,"ZIP_LINK_OR_SPECIAL_FILE"):
            self.inspect(buf.getvalue())
    def test_reject_high_compression_ratio(self):
        with self.assertRaisesRegex(ValueError,"ZIP_COMPRESSION_RATIO_EXCEEDED"):
            self.inspect(make([("large.txt",b"0"*200000)]))

if __name__=="__main__":
    unittest.main()
