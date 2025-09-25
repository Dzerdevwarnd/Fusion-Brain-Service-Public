import { Injectable } from '@nestjs/common'
import * as Sharp from 'sharp'

const sharp: any = (Sharp as any)?.default || (Sharp as any)

@Injectable()
export class ImageProcessingService {
	async detectOriginalFormat(imageBuffer: Buffer): Promise<string> {
		const sharpImg = sharp(imageBuffer, { failOnError: false })
		const metadata = await sharpImg.metadata()
		return metadata.format || 'png'
	}

	async makeThumbnailWebp(imageBuffer: Buffer, size = 128, quality = 90): Promise<Buffer> {
		return sharp(imageBuffer).resize(size, size, { fit: 'cover' }).webp({ quality }).toBuffer()
	}
}
