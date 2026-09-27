import json
import threading
import unittest
import urllib.error
import urllib.request
from unittest.mock import patch
import local_studio as studio


class LocalBoundaryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server=studio.ThreadingHTTPServer(('127.0.0.1',0),studio.Handler)
        studio.PORT=cls.server.server_port
        threading.Thread(target=cls.server.serve_forever,daemon=True).start()
        cls.base=f'http://127.0.0.1:{studio.PORT}'

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()

    def send(self,body,headers=None,path='/jobs'):
        request=urllib.request.Request(self.base+path,data=json.dumps(body).encode(),
            headers={'Content-Type':'application/json',**(headers or {})})
        try:
            with urllib.request.urlopen(request,timeout=5) as response: return response.status
        except urllib.error.HTTPError as error: return error.code

    def test_cross_origin_rejected(self):
        self.assertEqual(self.send({'kind':'text','prompt':'hello'},{'Origin':'https://example.org'}),403)

    def test_host_rebinding_rejected(self):
        self.assertEqual(self.send({'kind':'text','prompt':'hello'},{'Host':'attacker.example'}),403)

    def test_video_does_not_fall_back_to_paid_provider(self):
        self.assertEqual(self.send({'kind':'video','prompt':'hello'}),400)

    def test_body_and_prompt_limits(self):
        self.assertEqual(self.send({'kind':'text','prompt':'x'*17000}),413)
        self.assertEqual(self.send({'kind':'text','prompt':'x'*2001}),400)
        self.assertEqual(self.send([]),400)

    def test_unready_model_cannot_queue(self):
        with patch.object(studio,'capabilities',return_value={'text':False,'image':False}):
            self.assertEqual(self.send({'kind':'image','prompt':'hello'}),503)

    def test_only_one_job_at_a_time(self):
        with patch.object(studio,'capabilities',return_value={'text':True,'image':True}),patch.object(studio,'BUSY',True):
            self.assertEqual(self.send({'kind':'text','prompt':'hello'}),409)


if __name__=='__main__': unittest.main()
