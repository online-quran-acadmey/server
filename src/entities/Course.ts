
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, ManyToOne } from 'typeorm';
import { User } from './User';
import { Tutor } from './Tutor';

@Entity()
export class Course {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @ManyToOne(() => Tutor, (tutor) => tutor.courses)
    tutor: Tutor;

    @Column()
    rating: number;

    @Column()
    price: number;

    @Column({ default: 0 })
    discount: number;

    @ManyToMany(() => User, (user) => user.coursesEnrolled, { eager: true })
    @JoinTable()
    enrolledStudents: User[];

    @ManyToMany(() => User, (user) => user.requestedCourses, { eager: true })
    @JoinTable()
    requestedStudent: User[];

}
