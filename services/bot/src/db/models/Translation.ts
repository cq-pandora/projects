import { Translation as TranslationEntity } from '@pandora/entities';
import {
	Table, Column, Model, DataType, AutoIncrement, PrimaryKey, Default, AllowNull
} from 'sequelize-typescript';

import { ContextType } from '../../common-types';

@Table({
	tableName: 'translations',
	timestamps: false
})
export default class Translation extends Model<Translation> implements TranslationEntity {
	@PrimaryKey
	@AutoIncrement
	@AllowNull(false)
	@Column(DataType.INTEGER)
	id!: number;

	@AllowNull(false)
	@Column(DataType.STRING)
	key!: string;

	@AllowNull(false)
	@Column(DataType.STRING)
	text!: string;

	@Default(false)
	@AllowNull(true)
	@Column(DataType.BOOLEAN)
	status?: boolean;

	@AllowNull(false)
	@Column(DataType.STRING)
	version!: ContextType;

	original = false;
}
