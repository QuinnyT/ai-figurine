import React, { useEffect } from "react"
import styles from "./Dashboard.module.css"
import { ViewMode, ViewContext } from "../context/ViewContext"

import { SoundContext } from "../context/SoundContext"
import { AudioContext } from "../context/AudioContext"
import { SceneContext } from "../context/SceneContext"

import { connectWallet } from "../library/mint-utils"
import { useState } from "react"


const opensea_Key = import.meta.env.VITE_OPENSEA_KEY;

function Landing() {
  const { playSound } = React.useContext(SoundContext)
  const { isMute } = React.useContext(AudioContext)

  const createCharacter = () => {
    setViewMode(ViewMode.CREATE)
    !isMute && playSound('backNextButton');
  }

  const createVRMCharacter = () => {
    setViewMode(ViewMode.CLAIM)
    !isMute && playSound('backNextButton');
  }

  const optimizeCharacter = () => {
    setViewMode(ViewMode.OPTIMIZER)
    characterManager.loadOptimizerManifest();
    !isMute && playSound('backNextButton');
  }
  const getWallet = async() => {
    const address = await connectWallet()
    if (address != "")setViewMode(ViewMode.WALLET)
    !isMute && playSound('backNextButton');
  }

  const loadCharacter = () => {
    setViewMode(ViewMode.LOAD)
    !isMute && playSound('backNextButton');
  }

  const cards = [
    {
      name: 'FEMALE',
      infos: ['Figure 1', '17-02-2025', 'Related Avatars: 2', 'Produced']
    },
    {
      name: 'MALE',
      infos: ['Figure 1', '17-02-2025', 'Related Avatars: 2', 'Produced']
    },
    {
      name: 'DOLL',
      infos: ['Figure 1', '17-02-2025', 'Related Avatars: 2', 'Produced']
    }
  ]

  const agents = [
    {
      name: 'Happy Agent',
      infos: ['Figure 1', '17-02-2025', 'Related Avatars: 2', 'Produced']
    },
    {
      name: 'Happy Agent',
      infos: ['Figure 1', '17-02-2025', 'Related Avatars: 2', 'Produced']
    },
    {
      name: 'Happy Agent',
      infos: ['Figure 1', '17-02-2025', 'Related Avatars: 2', 'Produced']
    },
  ]
  
  const [ selectedIndex, setSelectedIndex ] = useState(0)
  const { manifest, characterManager } = React.useContext(SceneContext)
  const { setViewMode, setIsLoading } = React.useContext(ViewContext)
  
  
  const handleClickCard = (cardIndex) => {
    switch (selectedIndex) {
      case 0:
        // setViewMode(ViewMode.APPEARANCE)
        setIsLoading(true)
        characterManager.loadManifest(manifest.characters[cardIndex].manifest).then(()=>{
          setViewMode(ViewMode.APPEARANCE)
          characterManager.loadInitialTraits().then(()=>{
            setIsLoading(false)
          })
        })
        break;
      case 1:
        // setViewMode(ViewMode.ANIMATION)
        setIsLoading(true)
        characterManager.loadManifest(manifest.characters[0].manifest).then(()=>{
          setViewMode(ViewMode.ANIMATION)
          characterManager.loadInitialTraits().then(()=>{
            setIsLoading(false)
          })
        })
        break;
      default:
        break;
    }
  }
  
  return (
    <div className={styles["container"]}>
        <div className={styles["leftBar"]}>
            <img className={styles["logo"]} src="ui/Logo.svg"  />
            <div className={styles["userInfo"]} >
                <img className={styles["bigIcon"]} src="ui/user.svg"  />
                <div>User Name</div>
            </div>
            <img className={styles["smallIcon"]} src="ui/notification.svg"  />
            <img className={styles["smallIcon"]} src="ui/problem.svg"  />
            <img className={styles["smallIcon"]} src="ui/setting_small.svg"  />
        </div>

        <div className={styles["rightContainer"]}>
          <div className={styles["topBar"]}>
            <div className={styles["selector"]}>
              <div  className={selectedIndex == 0 ? styles["selector_selected_button"] : styles["selector_button"]} onClick={() => setSelectedIndex(0)} >
                {
                  selectedIndex == 0 ? <img style={{ width: '100%' }} src="ui/modular_design_selected_button.svg" alt="" /> :
                  <img style={{ width: '100%'}} src="ui/modular_design_button.svg" alt="" />
                }
              </div>
              <div  className={selectedIndex == 1 ? styles["selector_selected_button"] : styles["selector_button"]} onClick={() => setSelectedIndex(1)} >
                {
                  selectedIndex == 1 ? <img style={{ width: '100%'}} src="ui/ai_animation_selected_button.svg" alt="" /> :
                  <img style={{ width: '100%'}} src="ui/ai_animation_button.svg" alt="" />
                }
              </div>
              <div  className={selectedIndex == 2 ? styles["selector_selected_button"] : styles["selector_button"]} onClick={() => setSelectedIndex(2)} >
                {
                  selectedIndex == 2 ? <img style={{ width: '100%'}} src="ui/interaction_selected_button.svg" alt="" /> :
                  <img style={{ width: '100%'}} src="ui/interaction_button.svg" alt="" />
                }
              </div>
              <div  className={selectedIndex == 3 ? styles["selector_selected_button"] : styles["selector_button"]} onClick={() => setSelectedIndex(3)} >
                {
                  selectedIndex == 3 ? <img style={{ width: '100%'}} src="ui/asset_management_selected_button.svg" alt="" /> :
                  <img style={{ width: '100%'}} src="ui/asset_management_button.svg" alt="" />
                }
              </div>
                {/* <img className={setSelectedIndex == 0 ? styles["selector_selected_button"] : styles["selector_button"]} onClick={() => setSelectedIndex(0)} src={setSelectedIndex == 0 ? "ui/modular_design_selected_button.svg" : "ui/modular_design_button.svg"}  />
                <img className={setSelectedIndex == 1 ? styles["selector_selected_button"] : styles["selector_button"]} onClick={() => setSelectedIndex(1)} src="ui/ai_animation_button.svg"  />
                <img className={setSelectedIndex == 2 ? styles["selector_selected_button"] : styles["selector_button"]} onClick={() => setSelectedIndex(2)} src="ui/interaction_button.svg"  />
                <img className={setSelectedIndex == 3 ? styles["selector_selected_button"] : styles["selector_button"]} onClick={() => setSelectedIndex(3)} src="ui/asset_management_button.svg"  /> */}
            </div>
            <img className={styles["chart"]} src="ui/chart.svg"  />
          </div>

          <div className={styles["rightContent"]}>
            <div className={styles["title"]}>Designed Figurines</div>
            <div className={styles["cardContainer"]}>
            {cards.map((card, index) => {
              return (
                <div className={styles["card"]} key={index} onClick={() => handleClickCard(index)}>
                  <img className={styles["card_image"]} src="ui/doll_image.png" alt="" />
                  <div className={styles["card_name"]}>{card.name}</div>
                  <div className={styles["card_info"]}>
                    <div>{card.infos[0]}</div>
                    <div>{card.infos[1]}</div>
                  </div>
                  <div className={styles["card_info"]}>
                    <div>{card.infos[2]}</div>
                    <div>{card.infos[3]}</div>
                  </div>
                </div>
              )
            })}
            
            </div>
            <div className={styles["title"]}>AI Powered Avatars</div>
            <div className={styles["cardContainer"]}>
            {agents.map((card, index) => {
              return (
                <div className={styles["card"]} key={index} onClick={() => handleClickCard(index)}>
                  <img className={styles["card_image"]} src="ui/doll_image.png" alt="" />
                  <div className={styles["card_name"]}>{card.name}</div>
                  <div className={styles["card_info"]}>
                    <div>{card.infos[0]}</div>
                    <div>{card.infos[1]}</div>
                  </div>
                  <div className={styles["card_info"]}>
                    <div>{card.infos[2]}</div>
                    <div>{card.infos[3]}</div>
                  </div>
                </div>
              )
            })}
            
            </div>
          </div>
        </div>
    </div>
  )
 

  
}

export default Landing
