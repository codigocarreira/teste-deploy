import React from "react";
import "./styles.css";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { PiDropFill } from "react-icons/pi";
import { HiOutlineBeaker } from "react-icons/hi2";
import { FaVenusMars } from "react-icons/fa";
import { MdTag, MdFavorite } from "react-icons/md";

export default function CardAxolote({
  theme = "pink",
  specimenId,
  image,
  name,
  species,
  color,
  code,
  sex,
  isAlive,
  tankId,
  birthDate,
  onchainEntityId,
  onKnowMore,
}) {
  const formattedBirthDate = birthDate
    ? new Date(birthDate).toLocaleDateString("pt-BR")
    : "No informada";

  return (
    <article className={`ax-card ax-card--${theme}`}>
      <div className="ax-card__imageWrap">
        <img className="ax-card__image" src={image} alt={name} />
      </div>

      <div className="ax-card__content">
        <div className="ax-card__top">
          <div>
            <h3 className="ax-card__name">{name}</h3>
            <p className="ax-card__species">{species}</p>
          </div>

          <span className="ax-card__code">{code || specimenId}</span>
        </div>

        <ul className="ax-card__meta">
          <li className="ax-card__metaItem">
            <MdTag className="ax-card__metaIcon" />
            <span>Código: {code || "No informado"}</span>
          </li>

          <li className="ax-card__metaItem">
            <PiDropFill className="ax-card__metaIcon" />
            <span>Color: {color || "No informada"}</span>
          </li>

          <li className="ax-card__metaItem">
            <FaVenusMars className="ax-card__metaIcon" />
            <span>Sexo: {sex || "No informado"}</span>
          </li>

          <li className="ax-card__metaItem">
            <MdFavorite className="ax-card__metaIcon" />
            <span>Estado: {isAlive ? "Vivo" : "Inactivo"}</span>
          </li>
        </ul>
      </div>

      <div className="ax-card__action">
        <div className="ax-card__statusBlock">
          <div className="ax-card__status">
            <span className="ax-card__statusText">
              Nacimiento: {formattedBirthDate}
            </span>
            <AiOutlineCheckCircle className="ax-card__statusIcon" />
          </div>

          <div className="ax-card__tank">
            <div className="ax-card__tankHeader">
              <HiOutlineBeaker className="ax-card__tankIcon" />
              <span className="ax-card__tankLabel">Acuario actual</span>
            </div>

            <div className="ax-card__tankInfo">
              <span>Tanque #{tankId ?? "—"}</span>
              <span>On-chain ID: {onchainEntityId ?? "—"}</span>
            </div>
          </div>
        </div>

        <button className="ax-card__btn" type="button" onClick={onKnowMore}>
          Conóceme mejor
        </button>
      </div>
    </article>
  );
}
