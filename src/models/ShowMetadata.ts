import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToOne, PrimaryColumn } from "typeorm";
import { Show } from "./Show";
import { Genre } from "./Genre";
import { Image } from "./Image";

@Entity()
export class ShowMetadata {
  @PrimaryColumn()
  showId: number;

  @JoinColumn()
  @OneToOne(() => Show, show => show.metadata, { onDelete: 'CASCADE' })
  show: Show;

  @Column()
  title: string;

  @Column()
  overview: string;

  @Column({ type: 'date' })
  firstAirDate: Date;

  @Column()
  popularity: number;

  @Column()
  externalId: number;

  @ManyToMany(() => Genre, genre => genre.shows, {
    cascade: true,
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinTable({ name: 'show_metadata_genre' })
  genres: Genre[];

  @ManyToMany(() => Image, image => image.showMetadata, {
    cascade: true,
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinTable({ name: 'show_metadata_image' })
  images: Image[];
}