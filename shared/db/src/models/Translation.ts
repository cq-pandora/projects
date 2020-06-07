import {
	BaseEntity, Entity, PrimaryGeneratedColumn, Column,
} from 'typeorm';

import { Translation as TranslationEntity } from '@cquest/entities';

@Entity('translations')
export default class Translation extends BaseEntity implements TranslationEntity {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ nullable: false })
	key!: string;

	@Column({ nullable: false })
	text!: string;

	@Column({ default: false, nullable: true })
	status?: boolean;

	@Column({ nullable: false })
	version!: string;

	@Column({ nullable: false })
	locale!: string;

	original = false;
}
