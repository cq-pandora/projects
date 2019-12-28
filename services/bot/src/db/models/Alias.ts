import {
	Table, Column, Model, AllowNull, DataType, PrimaryKey
} from 'sequelize-typescript';

import { ContextType } from '../../common-types';

@Table({
	tableName: 'aliases',
	timestamps: false
})
class Alias extends Model<Alias> {
	@PrimaryKey
	@AllowNull(false)
	@Column(DataType.STRING)
	alias!: string;

	@AllowNull(false)
	@Column(DataType.STRING)
	for!: string;

	@AllowNull
	@Column(DataType.BOOLEAN)
	status?: boolean;

	@PrimaryKey
	@AllowNull(false)
	@Column(DataType.STRING)
	context!: ContextType;
}

export default Alias;
