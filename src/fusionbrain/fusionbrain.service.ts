import { Injectable, OnModuleInit } from '@nestjs/common'
import axios, { AxiosInstance } from 'axios'
import * as FormData from 'form-data'

interface FusionBrainClient {
	createImage(prompt: string, style: string): Promise<{ taskId: string }>
	getTaskStatus(
		taskId: string
	): Promise<{ status: 'INITIAL' | 'PROCESSING' | 'DONE' | 'FAIL'; errorDescription?: string; files?: string[] }>
	getResultFromStatus(files: string[]): Promise<Buffer>
}

class HttpFusionBrainClient implements FusionBrainClient {
	private http: AxiosInstance
	private baseUrl: string
	private apiKey?: string
	private secretKey?: string
	private pipelineId?: string

	constructor(options: { apiKey?: string; secretKey?: string; baseUrl?: string }) {
		this.baseUrl = options.baseUrl || 'https://api-key.fusionbrain.ai/'
		this.apiKey = options.apiKey
		this.secretKey = options.secretKey
		this.http = axios.create({ baseURL: this.baseUrl, responseType: 'json' })
	}

	private get authHeaders() {
		return {
			'X-Key': `Key ${this.apiKey || ''}`,
			'X-Secret': `Secret ${this.secretKey || ''}`,
		}
	}

	private async ensurePipelineId(): Promise<string> {
		if (this.pipelineId) return this.pipelineId
		const { data } = await this.http.get('key/api/v1/pipelines', { headers: this.authHeaders })
		// берём первую активную модель
		this.pipelineId = Array.isArray(data) && data.length > 0 ? (data[0].id ?? data[0].uuid) : undefined
		if (!this.pipelineId) throw new Error('Pipeline id not found')
		return this.pipelineId
	}

	async createImage(prompt: string): Promise<{ taskId: string }> {
		const pipelineId = await this.ensurePipelineId()
		const params = {
			type: 'GENERATE',
			numImages: 1,
			width: 1024,
			height: 1024,
			generateParams: { query: prompt },
		}
		// multipart/form-data: fields pipeline_id, params (application/json)
		const form = new FormData()
		form.append('pipeline_id', pipelineId)
		form.append('params', JSON.stringify(params), { contentType: 'application/json' })
		const { data } = await this.http.post('key/api/v1/pipeline/run', form, {
			headers: { ...this.authHeaders, ...form.getHeaders() },
		})
		return { taskId: data.uuid }
	}

	async getTaskStatus(
		taskId: string
	): Promise<{ status: 'INITIAL' | 'PROCESSING' | 'DONE' | 'FAIL'; errorDescription?: string; files?: string[] }> {
		const { data } = await this.http.get(`key/api/v1/pipeline/status/${taskId}`, { headers: this.authHeaders })
		return {
			status: data.status,
			errorDescription: data.errorDescription,
			files: data?.result?.files,
		}
	}

	async getResultFromStatus(files: string[]): Promise<Buffer> {
		// API возвращает base64 в поле files
		const base64 = files[0]
		return Buffer.from(base64, 'base64')
	}
}

@Injectable()
export class FusionBrainService implements OnModuleInit {
	private client!: FusionBrainClient

	async onModuleInit() {
		this.client = new HttpFusionBrainClient({
			apiKey: process.env.FUSION_BRAIN_API_KEY,
			secretKey: process.env.FUSION_BRAIN_API_SECRET,
			baseUrl: process.env.FUSION_BRAIN_API_URL || 'https://api-key.fusionbrain.ai/',
		})
	}

	async requestImage(prompt: string, style: string): Promise<string> {
		const { taskId } = await this.client.createImage(prompt, style)
		return taskId
	}

	async waitForResult(taskId: string, timeoutMs = 5 * 60 * 1000): Promise<Buffer> {
		const start = Date.now()
		while (Date.now() - start < timeoutMs) {
			const taskStatus = await this.client.getTaskStatus(taskId)
			if (taskStatus.status === 'DONE' && taskStatus.files && taskStatus.files.length > 0) {
				return this.client.getResultFromStatus(taskStatus.files)
			}
			if (taskStatus.status === 'FAIL') {
				throw new Error(taskStatus.errorDescription || 'Generation failed')
			}
			await new Promise(r => setTimeout(r, 2000))
		}
		throw new Error('Generation timeout')
	}
}
