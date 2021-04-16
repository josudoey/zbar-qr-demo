import OpenImage from './open-image'
import template from './template.pug'
import zbarScan from './zbar-scan'
export default {
  template,
  components: {
    'open-image': OpenImage
  },
  data: () => {
    return {
      tabIndex: 'image',
      result: ''
    }
  },
  methods: {
    scan: async function (img) {
      const canvas = this.$refs.canvas
      const { width, height } = img
      Object.assign(canvas, {
        width, height
      })
      const bitmap = await window.createImageBitmap(img)
      const ctx = canvas.getContext('2d')

      ctx.drawImage(bitmap, 0, 0, width, height)
      const imageData = ctx.getImageData(0, 0, width, height)
      const result = await zbarScan(imageData)
      this.result = JSON.stringify(result, null, 4)

      const qrcode = this.$refs.qrcode
      const qrcodeCtx = qrcode.getContext('2d')
      const W = 512
      const H = 512

      const code = result.shift()
      if (!code) {
        qrcodeCtx.clearRect(0, 0, W, H)
        return
      }

      const p = code.loc

      Object.assign(qrcode, {
        width: W, height: H
      })

      const qrcodeImage = qrcodeCtx.createImageData(W, H)
      const a = (p[3].x - p[0].x) / W
      const b = (p[1].x - p[0].x) / H
      const c = (p[2].x + p[0].x - p[3].x - p[1].x) / (W * H)
      const d = p[0].x
      const e = (p[3].y - p[0].y) / W
      const f = (p[1].y - p[0].y) / H
      const g = (p[2].y + p[0].y - p[3].y - p[1].y) / (W * H)
      const h = p[0].y

      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const index = (y * W + x) * 4
          const srcX = parseInt(a * x + b * y + c * x * y + d)
          const srcY = parseInt(e * x + f * y + g * x * y + h)
          const srcIndex = (srcY * width + srcX) * 4
          qrcodeImage.data[index] = imageData.data[srcIndex]
          qrcodeImage.data[index + 1] = imageData.data[srcIndex + 1]
          qrcodeImage.data[index + 2] = imageData.data[srcIndex + 2]
          qrcodeImage.data[index + 3] = imageData.data[srcIndex + 3]
        }
      }
      qrcodeCtx.putImageData(qrcodeImage, 0, 0)
    }
  }
}
