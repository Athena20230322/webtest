using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Security.Cryptography;
using System.IO;

using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.OpenSsl;
using Org.BouncyCastle.Security;
using static System.Windows.Forms.VisualStyles.VisualStyleElement;

namespace WindowsFormsApp1
{
    public partial class Form1 : Form
    {
        private string _publicKey = string.Empty;
        private string _privateKey = string.Empty;

        public Form1()
        {
            InitializeComponent();
        }

        private void Form1_Load(object sender, EventArgs e)
        {   

        }

        //加密
        private void button1_Click(object sender, EventArgs e)
        {
            string encryptData = Encrypt(textBox6.Text, textBox5.Text, textBox8.Text);
            textBox7.Text = encryptData;
            textBox3.Text = encryptData;
        }

        //解密
        private void button2_Click(object sender, EventArgs e)
        {
            textBox8.Text = Decrypt(textBox6.Text, textBox5.Text, textBox7.Text);
        }

        //簽章
        private void button4_Click(object sender, EventArgs e)
        {
            string input = textBox3.Text;
            ImportPemPrivateKey(textBox2.Text);
            textBox4.Text = SignDataWithSha256(input);

            //var xmlPublicKey = PemPublicKeyToXml(textBox1.Text);
            //var xmlPrivateKey = PemPrivateKeyToXml(textBox2.Text);
        }

        //驗證
        private void button3_Click(object sender, EventArgs e)
        {
            string input = textBox3.Text;
            string signDataStr = textBox4.Text;

            ImportPemPublicKey(textBox1.Text);

            bool flag = VerifySignDataWithSha256(input, signDataStr);

            MessageBox.Show(string.Format("驗證結果為 {0}", flag));
        }

        public string Encrypt(string key, string iv, string str)
        {
            string encrypt = "";

            try
            {
                AesCryptoServiceProvider aes = new AesCryptoServiceProvider();

                byte[] byteKey = Encoding.UTF8.GetBytes(key);
                byte[] byteIV = Encoding.UTF8.GetBytes(iv);

                aes.Key = byteKey;
                aes.IV = byteIV;

                byte[] dataByteArray = Encoding.UTF8.GetBytes(str);

                using (MemoryStream ms = new MemoryStream())
                using (CryptoStream cs = new CryptoStream(ms, aes.CreateEncryptor(), CryptoStreamMode.Write))
                {
                    cs.Write(dataByteArray, 0, dataByteArray.Length);
                    cs.FlushFinalBlock();
                    encrypt = Convert.ToBase64String(ms.ToArray());
                }
            }
            catch (Exception e)
            {
                MessageBox.Show(e.Message);
            }

            return encrypt;
        }

        public string Decrypt(string key, string iv, string str)
        {
            string decrypt = "";
            try
            {
                AesCryptoServiceProvider aes = new AesCryptoServiceProvider();

                byte[] byteKey = Encoding.UTF8.GetBytes(key);
                byte[] byteIV = Encoding.UTF8.GetBytes(iv);

                aes.Key = byteKey;
                aes.IV = byteIV;

                byte[] dataByteArray = Convert.FromBase64String(str);

                using (MemoryStream ms = new MemoryStream())
                {
                    using (CryptoStream cs = new CryptoStream(ms, aes.CreateDecryptor(), CryptoStreamMode.Write))
                    {
                        cs.Write(dataByteArray, 0, dataByteArray.Length);
                        cs.FlushFinalBlock();
                        decrypt = Encoding.UTF8.GetString(ms.ToArray());
                    }
                }
            }
            catch (Exception e)
            {
                MessageBox.Show(e.Message);
            }

            return decrypt;
        }


        /// <summary>
        /// 簽章 RSA Signing - SHA256
        /// </summary>
        /// <param name="base64String"></param>
        /// <returns></returns>
        public string SignDataWithSha256(string content)
        {
            byte[] input = Encoding.UTF8.GetBytes(content);
            //byte[] input = Encoding.ASCII.GetBytes(content);
            byte[] output = null;

            using (var provider = new RSACryptoServiceProvider())
            {
                provider.FromXmlString(_privateKey);

                using (var sha256 = new SHA256CryptoServiceProvider())
                {
                    output = provider.SignData(input, sha256);
                }
            }

            return Convert.ToBase64String(output);
        }

        /// <summary>
        /// 驗證 RSA Signing - SHA256
        /// </summary>
        /// <param name="base64Content"></param>
        /// <param name="base64Signature"></param>
        /// <returns></returns>
        public bool VerifySignDataWithSha256(string content, string base64Signature)
        {
            byte[] input = Encoding.UTF8.GetBytes(content);
            byte[] inputSignature = Convert.FromBase64String(base64Signature);

            using (var provider = new RSACryptoServiceProvider())
            {
                provider.FromXmlString(_publicKey);

                using (var sha256 = new SHA256CryptoServiceProvider())
                {
                    return provider.VerifyData(input, sha256, inputSignature);
                }
            }
        }

        /// <summary>
        /// Import OpenSSH PEM public key string into MS RSACryptoServiceProvider
        /// </summary>
        /// <param name="pem"></param>
        /// <returns></returns>
        public void ImportPemPublicKey(string pem)
        {
            // iOS PKCS#1
            if (pem.Length == 360)
            {
                pem = $"-----BEGIN RSA PUBLIC KEY-----{Environment.NewLine + pem + Environment.NewLine}-----END RSA PUBLIC KEY-----";
            }
            // PKCS#8
            else
            {
                pem = $"-----BEGIN PUBLIC KEY-----{Environment.NewLine + pem + Environment.NewLine}-----END PUBLIC KEY-----";
            }

            PemReader pr = new PemReader(new StringReader(pem));
            AsymmetricKeyParameter publicKey = (AsymmetricKeyParameter)pr.ReadObject();
            RSAParameters rsaParams = DotNetUtilities.ToRSAParameters((RsaKeyParameters)publicKey);

            using (var provider = new RSACryptoServiceProvider())
            {
                provider.ImportParameters(rsaParams);
                _publicKey = provider.ToXmlString(false);
            }
        }

        /// <summary>
        /// Import OpenSSH PEM private key string into MS RSACryptoServiceProvider
        /// </summary>
        /// <param name="pem"></param>
        /// <returns></returns>
        public void ImportPemPrivateKey(string pem)
        {
            pem = $"-----BEGIN RSA PRIVATE KEY-----{Environment.NewLine + pem + Environment.NewLine}-----END RSA PRIVATE KEY-----";

            PemReader pr = new PemReader(new StringReader(pem));
            AsymmetricCipherKeyPair KeyPair = (AsymmetricCipherKeyPair)pr.ReadObject();
            RSAParameters rsaParams = DotNetUtilities.ToRSAParameters((RsaPrivateCrtKeyParameters)KeyPair.Private);

            using (var provider = new RSACryptoServiceProvider())
            {
                provider.ImportParameters(rsaParams);
                _privateKey = provider.ToXmlString(true);
                _publicKey = provider.ToXmlString(false);
            }
        }

        public RSACryptoServiceProvider DecodePublicKey(string pem)
        {
            if (!pem.StartsWith("-----"))
            {
                // iOS PKCS#1
                if (pem.Length == 360)
                {
                    pem = $"-----BEGIN RSA PUBLIC KEY-----{Environment.NewLine + pem + Environment.NewLine}-----END RSA PUBLIC KEY-----";
                }
                // PKCS#8
                else
                {
                    pem = $"-----BEGIN PUBLIC KEY-----{Environment.NewLine + pem + Environment.NewLine}-----END PUBLIC KEY-----";
                }
            }

            PemReader pr = new PemReader(new StringReader(pem));
            AsymmetricKeyParameter publicKey = (AsymmetricKeyParameter)pr.ReadObject();
            RSAParameters rsaParams = DotNetUtilities.ToRSAParameters((RsaKeyParameters)publicKey);

            var provider = new RSACryptoServiceProvider();
            provider.ImportParameters(rsaParams);
            return provider;
        }

        public RSACryptoServiceProvider DecodePrivateKey(string pem)
        {
            if (!pem.StartsWith("-----"))
            {
                pem = $"-----BEGIN RSA PRIVATE KEY-----{Environment.NewLine + pem + Environment.NewLine}-----END RSA PRIVATE KEY-----";
            }

            PemReader pr = new PemReader(new StringReader(pem));
            AsymmetricCipherKeyPair KeyPair = (AsymmetricCipherKeyPair)pr.ReadObject();
            RSAParameters rsaParams = DotNetUtilities.ToRSAParameters((RsaPrivateCrtKeyParameters)KeyPair.Private);

            var provider = new RSACryptoServiceProvider();
            provider.ImportParameters(rsaParams);
            return provider;
        }


        /// <summary>
        /// Pem公钥转成XML公钥
        /// </summary>
        /// <param name="pemPublicKeyStr"></param>
        /// <returns></returns>
        public string PemPublicKeyToXml(string pemPublicKeyStr)
        {
            RsaKeyParameters pemPublicKey;
            using (var ms = new MemoryStream(Encoding.UTF8.GetBytes(pemPublicKeyStr)))
            {
                using (var sr = new StreamReader(ms))
                {
                    var pemReader = new Org.BouncyCastle.OpenSsl.PemReader(sr);
                    pemPublicKey = (RsaKeyParameters)pemReader.ReadObject();
                }
            }

            var p = new RSAParameters
            {
                Modulus = pemPublicKey.Modulus.ToByteArrayUnsigned(),
                Exponent = pemPublicKey.Exponent.ToByteArrayUnsigned()
            };

            string xmlPublicKeyStr;
            using (var rsa = new RSACryptoServiceProvider())
            {
                rsa.ImportParameters(p);
                xmlPublicKeyStr = rsa.ToXmlString(false);
            }

            return xmlPublicKeyStr;
        }

        // <summary>
        /// Pem私钥转成XML私钥
        /// </summary>
        /// <param name="pemPrivateKeyStr"></param>
        /// <returns></returns>
        public string PemPrivateKeyToXml(string pemPrivateKeyStr)
        {
            RsaPrivateCrtKeyParameters pemPrivateKey;
            using (var ms = new MemoryStream(Encoding.UTF8.GetBytes(pemPrivateKeyStr)))
            {
                using (var sr = new StreamReader(ms))
                {
                    var pemReader = new Org.BouncyCastle.OpenSsl.PemReader(sr);
                    var keyPair = (AsymmetricCipherKeyPair)pemReader.ReadObject();
                    pemPrivateKey = (RsaPrivateCrtKeyParameters)keyPair.Private;
                }
            }

            var p = new RSAParameters
            {
                Modulus = pemPrivateKey.Modulus.ToByteArrayUnsigned(),
                Exponent = pemPrivateKey.PublicExponent.ToByteArrayUnsigned(),
                D = pemPrivateKey.Exponent.ToByteArrayUnsigned(),
                P = pemPrivateKey.P.ToByteArrayUnsigned(),
                Q = pemPrivateKey.Q.ToByteArrayUnsigned(),
                DP = pemPrivateKey.DP.ToByteArrayUnsigned(),
                DQ = pemPrivateKey.DQ.ToByteArrayUnsigned(),
                InverseQ = pemPrivateKey.QInv.ToByteArrayUnsigned(),
            };

            string xmlPrivateKeyStr;
            using (var rsa = new RSACryptoServiceProvider())
            {
                rsa.ImportParameters(p);
                xmlPrivateKeyStr = rsa.ToXmlString(true);
            }

            return xmlPrivateKeyStr;
        }

        private void button5_Click(object sender, EventArgs e)
        {
            textBox6.Text = "roB09CO9EN7BffdhE1NEYFohq4YzwQX6";
            textBox5.Text = "DKhH0Fx1CPBpdKGs";
            textBox1.Text = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEApF8bKi+pucI5YtQNTnt2HJY3PMNcbtP/8w6TJB5FZsW59kfgnK0/ppKdwkb889t1q6uJiJwFyMLO72SvFhbJiT6l4z5NNh1Jo53EKAe/LUCS8KKMoOoVWso7lYakEVrAFvrYuZgBbpGOAA2zu6h9eO6XRyXRuDWdR+/64qUKaE4N6bn7BCX4ti9CcEDh6WOeUQbw4gWrzx/WnlbtTspzNrW4u2vDVttVnbtRFEIljX14auqt5I+tHW8n9NK7LvogYvTHIQmUQhPmqv2eTthU6xeLcVFfBsNeK8b9OSl26OuwonmgGTq77U4EbKqG9l3KJWcrJZp6vH5ZVHqtBJ89nQIDAQAB";
            textBox2.Text = "MIIEowIBAAKCAQEApF8bKi+pucI5YtQNTnt2HJY3PMNcbtP/8w6TJB5FZsW59kfgnK0/ppKdwkb889t1q6uJiJwFyMLO72SvFhbJiT6l4z5NNh1Jo53EKAe/LUCS8KKMoOoVWso7lYakEVrAFvrYuZgBbpGOAA2zu6h9eO6XRyXRuDWdR+/64qUKaE4N6bn7BCX4ti9CcEDh6WOeUQbw4gWrzx/WnlbtTspzNrW4u2vDVttVnbtRFEIljX14auqt5I+tHW8n9NK7LvogYvTHIQmUQhPmqv2eTthU6xeLcVFfBsNeK8b9OSl26OuwonmgGTq77U4EbKqG9l3KJWcrJZp6vH5ZVHqtBJ89nQIDAQABAoIBAHLq1zggSJ5JjwtsS71SDdqgnw/JWgdWCnzo9LBsxYK7vG7WA9AmQ/j2Snt4XAM1rMgPzsEGq/iXUkwGbW6ZEd/1P89nUF4EDebpNynxeJRvsAuy6XTbE4D9ILlCf9RuSRwH1puzDVU7SDb7XWxWuRpiXLtuUnhia4rO2e25C1SuFq+zINUmcrrFOPm8bOETKL9EesCyyUPf9rU0QmnoEYc+F2e4bvKs72TkOVpzdx9KECyIxlJfwqkB9wWTT/+rkn3HAkGJf8lwVXSx0Jkfpb5H7dWBFZS1YxZTxXx1bBsU0cdvjZbaW2Gyyc6iDN5n2+1Jl7HAGCKZ4QmEYJG8/dUCgYEAzkiEljj4f+obUPeWozX4LVRsaWNtTyvnijDiTewVBLhzjKZtnp62DKOlx4K4FPjBv52shkvt1Z0EW24ja4C+w6W92vMTCTIOq7rS14L6THb/E45DbF0Q0HBnwyxC68j/ILgU35XLT09iOOJ2KSigW9QSPIcYFJD0gl2J6hYdhn8CgYEAy/ysDq0zYkBox96Iw1JMEflW5WXKYmClqi4L7RjX3PS+KOX6M2KW5/B4fxxwK6QkShOqBw+lDHVbS1X311I5Z+USIuF7MVf4xAlol3qLUiHgSz+UOYJ/ctp+VO3by84PkRfTq0NVZdVt0U8gU/H/MMBiu4tuJWkXsfgza//vheMCgYBULdOtWeJOkMJE8ERQph14ohL7js90l34NLpWrJsQNARhmNSRWrn2r+rwUBowIQtsNztIwm5uaqFC23uMlY4x1WpV3W+pQvlSuT7bqq1BpE8ZTvKJW/kN2S+iMBOvqPEOgnn4mH4KwAr0aaY++jA2ka45llNuGyQB+kp1NIWk7EQKBgERrhdKOabPE4uBXVgwdqIJG3cyn7dA9lpOUSk/Gi3EDbl0NdnSR1wgI8oHAKieZMMrf+aHQr42UN4D3XuAMJlEg1op4kvekCD7I4Rod8mkkD7Vtp+v6R4FgpAsclSKxBSunkEnbleNISUNxhOhjPTM+9F7vj4xgyZ/aHnVVLSP9AoGBAJwTtQaaK7uaeMT+uOd5B5R5rc0M3VEwQtGrJ7gB5RO+kTNNNbIIHm+iCBvPe03gw8OO/ckf2EPGhXjdks0OtPPbdmxwnoTSeCYkjk1N7v4oQ2K2BtLhjBYK4B8kxwZq5Rp169Uz1fGtBztFjDi/VkBvwoWeJJNSLmUWto+VJ70R";
        }

        private void textBox6_TextChanged(object sender, EventArgs e)
        {

        }

        private void button6_Click(object sender, EventArgs e)
        {
            textBox6.Text = "hKG2sduiF22dQwywLULxzkeIfCJpoBmi";
            textBox5.Text = "WfIly9C6CfhJiiDP";
            textBox1.Text = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAn1hQPAny342r82LGQp+rr0L+JMPgmieJB8pSUEgd+QU51a/0hZMUoAyUCoNIoCwaU6vbuZpm/OYiahPTKVFety17VsGkKEx9cNgB3drRM7eHRosLBcvjdLa5d35aPKkfsGEwS4TssN5/gpbTdSCXxpBIqicPRmv6u4qX6wFncS8/TSDdzmIBOyX9UA7pxLDEPWYn9uNYxuMXIeJ8VRBeQYoj2M7yQY7Z0O3DQlnW/94ywuO3FABN/HWjx7COOecAPUoWE4IzVuCFh4y4S3rdBvDuVb6bXWHnHOwAs58b+kM3KN6Qhys+qP0WT5aR+CrvzAIXQiahFXFJFyWUIk8sUwIDAQAB";
            textBox2.Text = "MIIEpAIBAAKCAQEAn1hQPAny342r82LGQp+rr0L+JMPgmieJB8pSUEgd+QU51a/0hZMUoAyUCoNIoCwaU6vbuZpm/OYiahPTKVFety17VsGkKEx9cNgB3drRM7eHRosLBcvjdLa5d35aPKkfsGEwS4TssN5/gpbTdSCXxpBIqicPRmv6u4qX6wFncS8/TSDdzmIBOyX9UA7pxLDEPWYn9uNYxuMXIeJ8VRBeQYoj2M7yQY7Z0O3DQlnW/94ywuO3FABN/HWjx7COOecAPUoWE4IzVuCFh4y4S3rdBvDuVb6bXWHnHOwAs58b+kM3KN6Qhys+qP0WT5aR+CrvzAIXQiahFXFJFyWUIk8sUwIDAQABAoIBAA5rBUeJdup3fTmWlG3u2LARFcHp32bTcPi9e9k7zUp9CJCnTS7Q8irROIwC+Q1VMESl5knTCMKVaEPE63Rvomxcty5QczQaR7dwNCsI46kUUC834ZVyr3AeIIYJbszSWMWy5ZXPv0L5vvvn/dY5TsJux8RtqFos5xEVJ03iYKPDB+ppESMxHShimzGldB7Lq6cRp7im3xPXNgqKPnifymOgs/A+ulAgNW40of6cr1rNXpSLB41I2m57a7H1NbCyloSdvFpr8WlWg9N+xlB5afkjXqh5ldqr2QsRsRiDCRzbxWxgv/C694xjBgFOfuZyUu+2mSe8MDKTqyLnJ/2xRkECgYEAtWs4dQuYWmbB6iT2R6kaRx85EYHOAI6GvJFQhFbnKRDhFn6mwZWYrQkMnTcWQ5cw1IpXWPxbRGGYgRoZ4ZcQ6KgBmK3e+K8AfxEwIjf7F3Qnmn9l5kXctzh7waMhbY9M22dabaf38mlzVQTbwPsTbbjH8VzeKq9Gv1HK+X5fDWMCgYEA4NoCKIMkz/MNUhmKhtA4tBW+n7nI8eAxyv2xREfMWQvrHxjw6HQ/17elDABxKkSkVDWLEX6hrreJCDLF6vpfqqfV37tyikr5ynSFx2i6owNnKr7wDF8F7uyyB+JLA/xofRO0eSYMADXBxfCno8qzz7GYkTPhojojYl/6NZXPUFECgYANMXTznhpASMTFYFbAs12D2pNt4IC4raTCxdaTKTa6V83msuMxpM1rmALg1Aa8d5xHeKANipyghnBuwxUqwK+sG7ux/MMAVsm0c+2KL4QFGp9ervEcI+x/Lo5hcJmXvBocwpFi9Bol+OE4R5grmpa5Hfz8YoKNnB2LAEnAhx4mfQKBgQCiGak6qakNXcz5pj4vCMgIVDDUF+0dKyLak+CLODPC8ou0JJfxDXXFP7j2GQ98iHXr25oBp8hKHDjnNytmRtBXSJ4wqINf3cONSEn1w7Pht59Vusd2M78kS3HhqyunmP1/RohyWpKGSDsFR4Sj2YueLQuvirac7Mr7rfPFU9ZcsQKBgQCr3Wy4N0V0+9NcwxJLbKz0fpssMcRYBhA4Zm9nJ1SVXaGuXs/5bmN/O/yEg42NtiDp3B4e2SeSP1jd+leCxgkaXMsXRxEJNL8inKtqj8mHdOl0CXuIsn7M8pWP/73IaEoiS9kN7zfwUUxrFVfMTS5cnTTGeDeZnxQ56BDxq4vilQ==";
        }

        private void textBox8_TextChanged(object sender, EventArgs e)
        {

        }

        private void button7_Click(object sender, EventArgs e)
        {
            textBox3.Focus();
            textBox3.SelectAll();
            SendKeys.Send("^{C}");
        }

        private void textBox3_TextChanged(object sender, EventArgs e)
        {

        }

        private void button8_Click(object sender, EventArgs e)
        {
            textBox4.Focus();
            textBox4.SelectAll();
            SendKeys.Send("^{C}");
        }
    }
}
