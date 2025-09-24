import { Injectable, OnModuleInit } from '@nestjs/common'
import { Client } from 'minio'

@Injectable()
export class MinioService implements OnModuleInit {
	private client!: Client
	private bucket: string = process.env.MINIO_BUCKET || 'images'

	async onModuleInit() {
		this.client = new Client({
			endPoint: process.env.MINIO_ENDPOINT || 'localhost',
			port: Number(process.env.MINIO_PORT || 9000),
			useSSL: (process.env.MINIO_USE_SSL || 'false') === 'true',
			accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
			secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
		})
		const exists = await this.client.bucketExists(this.bucket).catch(() => false)
		if (!exists) {
			await this.client.makeBucket(this.bucket, '')
		}
	}

	async putObject(objectName: string, data: Buffer, contentType?: string) {
		await this.client.putObject(this.bucket, objectName, data, data.length, {
			'Content-Type': contentType || 'application/octet-stream',
		})
		return this.getObjectUrl(objectName)
	}

	async getObject(objectName: string) {
		return this.client.getObject(this.bucket, objectName)
	}

	getObjectUrl(objectName: string) {
		const protocol = (process.env.MINIO_USE_SSL || 'false') === 'true' ? 'https' : 'http'
		return `${protocol}://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || 9000}/${this.bucket}/${objectName}`
	}
}
