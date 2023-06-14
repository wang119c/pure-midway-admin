const SHA256 = require("crypto-js/sha256");
import CryptoJS from 'crypto-js'

// 默认秘钥(如果和其他约定的其他key,重新定义)
export const KEY = 'kbnDRjm8hMEWWp6PPQlsqu0WHMs8kScQ'

export function sha256(str, salt = '123456') {
  return SHA256(str+salt).toString()
}

/**
 * AES加密
 * @param {*} text 要加密的密文(字符串)
 * @param {*} key 秘钥 (32位字符串 必须)
 * @param {*} mode 模式(以防其他人用别的模式)
 */
export function aesEncrypt(text, key, mode = CryptoJS.mode.ECB) {
  const newKey = key || KEY
  let needKey = CryptoJS.enc.Utf8.parse(newKey)
  const iv = CryptoJS.enc.Utf8.parse(newKey.substr(0, 16))
  let encryptedData = CryptoJS.AES.encrypt(text, needKey, {
    iv: iv,
    mode,
    padding: CryptoJS.pad.Pkcs7
  })
  return CryptoJS.enc.Base64.stringify(encryptedData.ciphertext)
}

/**
 * AES 解密
 * @param {*} ciphertext  密文
 * @param {*} key 秘钥 (32位字符串 必须)
 * @param {*} mode 模式(以防其他人用别的模式)
 */
export function aesDecrypt(ciphertext, key, mode = CryptoJS.mode.ECB) {
  const newKey = key || KEY
  let needKey = CryptoJS.enc.Utf8.parse(newKey)
  const iv = CryptoJS.enc.Utf8.parse(newKey.substr(0, 16))
  let encryptedHexStr = CryptoJS.enc.Base64.parse(ciphertext)
  let encryptedBase64Str = CryptoJS.enc.Base64.stringify(encryptedHexStr)
  let decryptedData = CryptoJS.AES.decrypt(encryptedBase64Str, needKey, {
    iv: iv,
    mode,
    padding: CryptoJS.pad.Pkcs7
  })
  return decryptedData.toString()
}


