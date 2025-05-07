import React, { useState } from "react"
import styles from "./AnimationRightPanel.module.css"
import { SceneContext } from "../context/SceneContext.jsx"

export default function TestRightPanel({traitGroupName}){

    const [rightPanelShowing, setRightPanelShowing] = useState(false)
    

    return (
        <div>
            <div className={styles["InformationContainerPos"]}>
                <div className={styles["editor"]}  style={{ transform: rightPanelShowing ? 'scaleY(1)' : 'scaleY(0.1)' }}>
                    {rightPanelShowing && <div className={styles["editor-container"]}>
                        <div className={styles["optionsContainer"]}>
                            <div className={styles["seletorItem"]}>Voice</div>
                            <div className={styles["seletorItem"]}>Behaviors</div>
                            <div className={styles["seletorItem"]}>Response</div>
                        </div>
                        <div className={styles["editor-controller"]}>
                            <img className={styles["cancelIcon"]} src="ui/cancel.svg" />
                        </div>
                    </div>}
                </div>

            </div>
            <img className={styles["rightPanelTriggerIcon"]} src="ui/decorate.svg" onClick={() => {setRightPanelShowing(!rightPanelShowing)}} />

        </div>
    )
}