import React from "react"

import styles from "./Background.module.css"
import { SceneContext } from "../context/SceneContext"
export default function Background() {
  const {
    debugMode,
  } = React.useContext(SceneContext)
  return (
    <div className={debugMode ? styles["lightBackground"] : styles["backgroundImg"]}>
      <div className={styles["backgroundBlur"]}></div>
      <div className={styles["Background"]}>
      </div>
    </div>
  )
}
