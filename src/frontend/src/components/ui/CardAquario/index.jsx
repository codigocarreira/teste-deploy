import React from "react";
import "./styles.css";
import { FiMapPin } from "react-icons/fi";
import { LuWaves } from "react-icons/lu";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { HiOutlineUsers } from "react-icons/hi2";
import { MdOutlineFilterAlt, MdOutlineScience, MdTag } from "react-icons/md";

export default function CardAquario({
  theme = "blue",
  tankId,
  image,
  name,
  code,
  species,
  location,
  volumeNominal,
  volumeEfetivo,
  quantity,
  tankType,
  filterType,
  systemType,
  aeratorType,
  onchainEntityId,
  onKnowMore,
}) {
  return (
    <article className={`tank-card tank-card--${theme}`}>
      <div className="tank-card__imageWrap">
        <img className="tank-card__image" src={image} alt={name} />
      </div>

      <div className="tank-card__content">
        <div className="tank-card__top">
          <div>
            <h3 className="tank-card__name">{name}</h3>
            <p className="tank-card__species">
              {species || "Especies no informadas"}
            </p>
          </div>

          <span className="tank-card__code">{code || `#${tankId}`}</span>
        </div>

        <ul className="tank-card__meta">
          <li className="tank-card__metaItem">
            <FiMapPin className="tank-card__metaIcon" />
            <span>Ubicación: {location || "No informada"}</span>
          </li>

          <li className="tank-card__metaItem">
            <LuWaves className="tank-card__metaIcon" />
            <span>
              Volumen nominal:{" "}
              {volumeNominal ? `${volumeNominal} L` : "No informado"}
            </span>
          </li>

          <li className="tank-card__metaItem">
            <MdTag className="tank-card__metaIcon" />
            <span>Tipo de tanque: {tankType || "No informado"}</span>
          </li>
        </ul>
      </div>

      <div className="tank-card__action">
        <div className="tank-card__statusBlock">
          <div className="tank-card__status">
            <span className="tank-card__statusText">
              Volumen efectivo:{" "}
              {volumeEfetivo ? `${volumeEfetivo} L` : "No informado"}
            </span>
            <AiOutlineCheckCircle className="tank-card__statusIcon" />
          </div>

          <div className="tank-card__specimensBox">
            <div className="tank-card__specimensHeader">
              <HiOutlineUsers className="tank-card__specimensIcon" />
              <span className="tank-card__specimensLabel">
                Ajolotes en el acuario
              </span>
            </div>

            <div className="tank-card__specimensInfo">
              <span>{quantity ?? 0} ejemplar(es)</span>
            </div>
          </div>
        </div>

        <button className="tank-card__btn" type="button" onClick={onKnowMore}>
          Ver más detalles
        </button>
      </div>
    </article>
  );
}
