import React, { useState } from "react"
import styles from "./TestRightPanel.module.css"
// import MenuTitle from "./MenuTitle"
import traitsIcon from "../images/t-shirt.png"
import genSpriteIcon from "../images/users.png"
import emotionIcon from "../images/emotion.png"
import genLoraIcon from "../images/paste.png"
import genThumbIcon from "../images/portraits.png"
import { TokenBox } from "./token-box/TokenBox"
// import TraitInformation from "./TraitInformation"
// import LoraCreation from "./LoraCreation"
// import SpriteCreation from "./SpriteCreation"
// import ThumbnailCreation from "./ThumbnailCreation"
// import Emotions from "./Emotions"
import { ChromePicker   } from 'react-color'
import { SceneContext } from "../context/SceneContext.jsx"

export default function TestRightPanel({selectedTrait, selectedVRM, traitGroupName, setIsLoading}){
    console.log("selectedTrait", selectedTrait)
    const { characterManager } = React.useContext(SceneContext)
    const [selectedOption, setSelectedOption] = React.useState("")
    const setSelectedOptionString = (option) => {
        if (option != selectedOption){
            setSelectedOption(option);
        }
        else{
            setSelectedOption("");
        }
    }
    const [isPickingColor, setIsPickingColor] = React.useState(false)
    const [colorPicked, setColorPicked] = React.useState({ background: '#ffffff' })

    const [textureGroups, setTextureGroups] = React.useState(null)
    const [isSelectingTexture, setIsSelectingTexture] = React.useState(false)
    const [selectedTexture, setSelectedTexture] = React.useState(null)

    React.useEffect(() => {
        if (selectedTrait !==  null && selectedTrait.targetTextureCollection ) {
            setTextureGroups(selectedTrait?.targetTextureCollection.collection);
        }
    }, [selectedTrait])


    const handleColorChange = (color) => {
        setColorPicked({ background: color.hex });
      }
    
    const handleChangeComplete = (color) =>{
      setColorPicked({ background: color.hex });
      characterManager.setTraitColor(traitGroupName, color.hex);
    } 
    
    const buttons = ['Color', 'Material', 'Texture']
    const [rightPanelShowing, setRightPanelShowing] = useState(false)
    const [selectedButton, setSelectedButton] = useState(null)
    
    const handleButtonClick = (buttonName) => {
        setSelectedButton(buttonName)
        if (buttonName == 'Color' ) {
            setIsSelectingTexture(false)
            setIsPickingColor(!isPickingColor)
        }
        else if (buttonName == 'Texture' )  {
            setIsPickingColor(false)
            setIsSelectingTexture(!isSelectingTexture)
        }
    }

    const handleRightTriggerClick = () => {
        setRightPanelShowing(!rightPanelShowing);
        setSelectedButton(null);
        setIsPickingColor(false);
        setIsSelectingTexture(false);
    }

    const setTexture = (texture) => {
        console.log("texture", texture)
        console.log("traitGroupName", traitGroupName)

        if (traitGroupName){
            setIsLoading(true);
            const path = texture.fullDirectory;
            characterManager.loadCustomTexture(traitGroupName, path).then(()=>{
              setIsLoading(false);
            })
          }
          else{
            console.warn("Please select a group trait first.")
          }
          
        setSelectedTexture(texture);
    }

    return (
        <div>
            <div className={styles["InformationContainerPos"]}>
                {rightPanelShowing && <div className={styles["rightMenuTitle"]}>
                    <div>Object</div>
                    <div className={styles["objectId"]}>FTY3R7</div>
                </div>}
                <div className={styles["editor"]}  style={{ transform: rightPanelShowing ? 'scaleY(1)' : 'scaleY(0.1)' }}>
                    {rightPanelShowing && <div className={styles["editor-container"]}>
                        <div className={styles["optionsContainer"]}>
                            {buttons.map((item) => {
                                return (
                                    <div key={item} className={styles["seletorItem"]} style={{ backgroundImage: selectedButton == item ? "url('ui/seleced_button_bg.png')" : '' }} onClick={() => handleButtonClick(item)}>{item}</div>
                                )
                            })}

                            {/* <div className={styles["seletorItem"]} style={{ backgroundImage: selectedButton == 'Material' ? "url('ui/seleced_button_bg.png')" : '' }} onClick={handleButtonClick('Material')}>Material</div>
                            <div className={styles["seletorItem"]} style={{ backgroundImage: selectedButton == 'Texture' ? "url('ui/seleced_button_bg.png')" : '' }} onClick={handleButtonClick('Texture')}>Texture</div> */}
                        </div>
                        <div className={styles["editor-controller"]}>
                            <img className={styles["cancelIcon"]} src="ui/cancel.svg" />
                        </div>
                    </div>}
                </div>

            </div>
            <img className={styles["rightPanelTriggerIcon"]} src="ui/decorate.svg" onClick={handleRightTriggerClick} />

             {
               isPickingColor && (<div 
             draggable = {false}
             className={styles["selectorColorPickerUI"]}>
             <ChromePicker 
               styles={{ default: {picker:{ width: '200px' }} }}
               color={ colorPicked.background }
               onChange={ handleColorChange }
               onChangeComplete={ handleChangeComplete }
               />
           </div>)}

            {
                isSelectingTexture && textureGroups && (
                <div className={styles["selectorContainerPos"]}>
                     <div className={styles["selector-container"]}>
                    {textureGroups.map((texture) => {
                    let active = texture.id === selectedTexture?.id
                      return (
                        <div
                          key={texture.id}
                          className={`${styles["selectorButton"]}`}
                          onClick={()=>{setTexture(texture)}}
                        >
                          <TokenBox
                            size={100}
                            icon={texture.fullThumbnail}
                            rarity={active ? "mythic" : "none"}      
                          />
                        </div>
                      )
                    })}
                     </div>
                </div>)
            }

        </div>
    )
}