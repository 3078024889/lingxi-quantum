#!/usr/bin/env python3
"""Offline tests: no ECS access and no passwords or real Supabase credentials."""
import importlib.util
import pathlib
import unittest
from unittest import mock
source=pathlib.Path(__file__).resolve().parents[2]/"scripts/ops/ecs-cn-live3191-admin-hotfix-20261108.py"
spec=importlib.util.spec_from_file_location("cn3191",str(source))
target=importlib.util.module_from_spec(spec)
spec.loader.exec_module(target)

class Live3191KeyTests(unittest.TestCase):
    def test_no_changes_to_other_environment_keys(self):
        original="NEXT_PUBLIC_SUPABASE_URL=https://sxsgdpqojepgbbrxrzlq.supabase.co\nPUBLIC_A=keep\nSUPABASE_SERVICE_ROLE_KEY=expired\nOTHER=stable\n"
        key="sb_secret_"+"z"*30
        changed=target.safe_patch(original,key)
        self.assertIn("PUBLIC_A=keep",changed)
        self.assertIn("OTHER=stable",changed)
        self.assertIn("SUPABASE_SERVICE_ROLE_KEY="+key,changed)
        self.assertNotIn("SUPABASE_SERVICE_ROLE_KEY=expired",changed)
        self.assertEqual(target.safe_patch(changed,key),changed)

    def test_added_key_does_not_duplicate(self):
        original="NEXT_PUBLIC_SUPABASE_URL=https://sxsgdpqojepgbbrxrzlq.supabase.co\n"
        changed=target.safe_patch(original,"sb_secret_"+"a"*30)
        self.assertEqual(changed.count("SUPABASE_SERVICE_ROLE_KEY="),1)

    def test_duplicate_old_secret_fails_closed(self):
        original="SUPABASE_SERVICE_ROLE_KEY=a\nSUPABASE_SERVICE_ROLE_KEY=b\n"
        with self.assertRaisesRegex(RuntimeError,"MULTIPLE_LEGACY_ADMIN_KEYS"):
            target.safe_patch(original,"sb_secret_"+"a"*30)

    def test_duplicate_new_source_fails_closed(self):
        original="SUPABASE_SECRET_KEY=a\nSUPABASE_SECRET_KEY=b"
        with self.assertRaisesRegex(RuntimeError,"DUPLICATE_ENV_VARIABLE"):
            target.value(original,"SUPABASE_SECRET_KEY")

    def test_three_environment_files_preserve_systemd_order(self):
        files="/etc/lingxifield/production.env (ignore_errors=no) /etc/lingxifield/payment.env (ignore_errors=no) /etc/lingxifield/runtime.env (ignore_errors=no)"
        texts={
          "/etc/lingxifield/production.env":"SUPABASE_URL=https://sxsgdpqojepgbbrxrzlq.supabase.co\\nSUPABASE_SECRET_KEY=sb_secret_placeholder\\n",
          "/etc/lingxifield/payment.env":"PAYMENT_API_ENABLED=false\\n",
          "/etc/lingxifield/runtime.env":"SUPABASE_SERVICE_ROLE_KEY=invalid-legacy\\n"
        }
        def run(*args, **kwargs):
            if args[:2]==("systemctl","is-active"):return "active"
            if "WorkingDirectory" in args:return "/opt/lingxifield/releases/86b956c9700ede4a537c021af3a0dc1df825fa9b"
            if "EnvironmentFiles" in args:return files
            if "Environment" in args:return ""
            raise AssertionError("unknown systemctl query")
        def fake_read(p, *args, **kwargs):
            return texts[str(p)]
        with mock.patch.object(target,"run",side_effect=run), \\
             mock.patch.object(target,"assert_secure_file"), \\
             mock.patch.object(pathlib.Path,"read_text",fake_read):
            dest=target.effective_file()
        self.assertEqual(str(dest),"/etc/lingxifield/runtime.env")

    def test_three_environment_files_wrong_project_aborts(self):
        files="/etc/lingxifield/a.env (ignore_errors=no) /etc/lingxifield/b.env (ignore_errors=no) /etc/lingxifield/c.env (ignore_errors=no)"
        texts={
          "/etc/lingxifield/a.env":"SUPABASE_URL=https://wrong-project.supabase.co\\n",
          "/etc/lingxifield/b.env":"SUPABASE_SERVICE_ROLE_KEY=old\\n",
          "/etc/lingxifield/c.env":"PAYMENT_READY=false\\n"
        }
        def run(*args, **kwargs):
            if args[:2]==("systemctl","is-active"):return "active"
            if "WorkingDirectory" in args:return "/opt/lingxifield/86b956c9700ede4a537c021af3a0dc1df825fa9b"
            if "EnvironmentFiles" in args:return files
            if "Environment" in args:return ""
            raise AssertionError("unknown query")
        with mock.patch.object(target,"run",side_effect=run), \\
             mock.patch.object(target,"assert_secure_file"), \\
             mock.patch.object(pathlib.Path,"read_text",lambda p,*a,**k:texts[str(p)]):
            with self.assertRaisesRegex(RuntimeError,"LIVE_SERVICE_EFFECTIVE_PROJECT_MISMATCH"):
                target.effective_file()

    def test_script_targets_live_3191_not_retired_ports(self):
        self.assertEqual(target.SERVICE,"lingxifield-cn-release-86b956c9700e")
        self.assertIn("86b956c9700ede4a537c021af3a0dc1df825fa9b",target.RELEASE)
        with mock.patch.object(target,"check_http") as check:
            target.baseline()
        self.assertEqual(check.call_count,4)
        self.assertTrue(all(x[0][1] in (200,401) for x in check.call_args_list))

    def test_plan_is_not_mutating(self):
        with mock.patch.object(target,"effective_file",side_effect=RuntimeError("PRECHECK_STOP")):
            with mock.patch.object(target,"atomic_write") as write:
                with mock.patch.object(target,"run"):
                    with mock.patch.object(target,"verify_key"):
                        with self.assertRaises(RuntimeError):
                            target.effective_file()
                        write.assert_not_called()

if __name__=="__main__":
    unittest.main(verbosity=2)
