import { Inject, Injectable } from '@nestjs/common'
import { FusionBrainClient } from './fusionbrain.client'

@Injectable()
export class FusionBrainService {
	constructor(@Inject('FUSION_CLIENT') private readonly client: FusionBrainClient) {}

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
