import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './User';

@Entity()
export class Complain {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    subject: string;

    @Column()
    description: string; 

    @ManyToOne(() => User, { cascade: true })
    user: User;

    @Column({ default: false })
    isClosed: boolean;
}
