import {
	BaseEntity, Entity, PrimaryColumn, Column
} from 'typeorm';

import { ContextType } from '@pandora/entities';

@Entity('aliases')
class Alias extends BaseEntity {
	@PrimaryColumn({ nullable: false })
	alias!: string;

	@Column({ nullable: false })
	for!: string;

	@Column({ nullable: true })
	status?: boolean;

	@PrimaryColumn({ nullable: false })
	context!: ContextType;
}

export default Alias;
