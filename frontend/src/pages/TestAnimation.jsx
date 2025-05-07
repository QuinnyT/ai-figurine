import React, { useContext, useState } from "react"
import styles from "./TestAnimation.module.css"
import { ViewMode, ViewContext } from "../context/ViewContext.jsx"
import { SceneContext } from "../context/SceneContext.jsx"
import CustomButton from "../components/custom-button/index.jsx"
import { LanguageContext } from "../context/LanguageContext.jsx"
import { SoundContext } from "../context/SoundContext.jsx"
import { AudioContext } from "../context/AudioContext.jsx"
import FileDropComponent from "../components/FileDropComponent.jsx"
import { getFileNameWithoutExtension } from "../library/utils.js"
// import MenuTitle from "../components/MenuTitle.jsx"
// import BottomDisplayMenu from "../components/BottomDisplayMenu.jsx"
import TestAnimationBottomDisplayMenu from "../components/TestAnimationBottomDisplayMenu.jsx"
// import decalPicker from "../images/sticker.png"
import { TokenBox } from "../components/token-box/TokenBox.jsx"
import JsonAttributes from "../components/JsonAttributes.jsx"
import cancel from "../images/cancel.png"
import DecalGridView from "../components/decals/decalGrid.jsx"
import randomizeIcon from "../images/randomize.png"
// import colorPicker from "../images/color-palette.png"
import { ChromePicker   } from 'react-color'
// import RightPanel from "../components/RightPanel.jsx"
import AnimationRightPanel from "../components/AnimationRightPanel.jsx"
import { useEffect } from "react"

  /**
   * @typedef {import("../library/CharacterManifestData.js").TraitModelsGroup} TraitModelsGroup
   * @typedef {import("../library/CharacterManifestData.js").ModelTrait} ModelTrait
  */

export const TraitPage ={
  TRAIT:0,
  BLEND_SHAPE:1,
  DECAL:2
}

function Test() {
  const { isLoading, setViewMode, setIsLoading } = React.useContext(ViewContext)
  const {
    toggleDebugMode,
    characterManager,
    animationManager,
    moveCamera,
  } = React.useContext(SceneContext)
  
  const [traitView, setTraitView] = React.useState(TraitPage.TRAIT)

  const { playSound } = React.useContext(SoundContext)
  const { isMute } = React.useContext(AudioContext)
  const { t } = useContext(LanguageContext)
  

  const back = () => {
    !isMute && playSound('backNextButton');
    characterManager.removeCurrentCharacter();
    characterManager.removeCurrentManifest();
    setViewMode(ViewMode.DASHBOARD)
    toggleDebugMode(false);
  }

  const [jsonSelectionArray, setJsonSelectionArray] = React.useState(null)
  const [traits, setTraits] = React.useState(null)
  /**
  * @type {[TraitModelsGroup, React.Dispatch<TraitModelsGroup>]} state
  */
  const [selectedTraitGroup, setSelectedTraitGroup] = React.useState(null)
  /**
   * @type {[ModelTrait|null, React.Dispatch<ModelTrait|null>]} state
   */
  const [selectedTrait, setSelectedTrait] = React.useState(null)
  const [selectedBlendshapeTraits, setSelectedBlendshapeTraits] = React.useState({})
  const [selectedVRM, setSelectedVRM] = React.useState(null)
  const [loadedAnimationName, setLoadedAnimationName] = React.useState("");
  const [isPickingColor, setIsPickingColor] = React.useState(false)
  const [colorPicked, setColorPicked] = React.useState({ background: '#ffffff' })

  const next = () => {
    !isMute && playSound('backNextButton');
    setViewMode(ViewMode.SAVE);
    toggleDebugMode(false);
  }

  const randomize = () => {
    setIsLoading(true);
    setJsonSelectionArray(null);
    characterManager.loadRandomTraits().then(() => {
      console.log("success")
      if (selectedTraitGroup && selectedTraitGroup.trait != ""){
        setSelectedTrait(characterManager.getCurrentTraitData(selectedTraitGroup.trait));
      }
      setIsLoading(false);
    })
    .catch((error) => {
      setIsLoading(false);
      console.error("Error loading random traits:", error.message);
    });
  }

  const handleColorChange = (color) => {
    setColorPicked({ background: color.hex });
  }
  const handleChangeComplete = (color) =>{
    setColorPicked({ background: color.hex });
    characterManager.setTraitColor(selectedTraitGroup?.trait, color.hex);
  } 

  const handleAnimationDrop = async (file) => {
    const animName = getFileNameWithoutExtension(file.name);
    const path = URL.createObjectURL(file);
    await animationManager.loadAnimation(path,false,0, true, "", animName);
    setLoadedAnimationName(animationManager.getCurrentAnimationName());
  }

  const handleImageDrop = (file) => {
    setIsPickingColor(false);
    if (selectedTraitGroup && selectedTraitGroup.trait != ""){
      setIsLoading(true);
      const path = URL.createObjectURL(file);
      characterManager.loadCustomTexture(selectedTraitGroup.trait, path).then(()=>{
        setIsLoading(false);
      })
    }
    else{
      console.warn("Please select a group trait first.")
    }
  }
  const handleVRMDrop = (file) =>{
    setIsPickingColor(false);
    if (selectedTraitGroup && selectedTraitGroup.trait != ""){
      setIsLoading(true);
      const path = URL.createObjectURL(file);
      characterManager.loadCustomTrait(selectedTraitGroup.trait, path).then(()=>{
        setIsLoading(false);
      })
    }
    else{
      console.warn("Please select a group trait first.")
    }
  }
  const selectTrait = (trait) => {
    if(trait.id === selectedTrait?.id){
      if(trait.blendshapeTraits?.length>0){
        setTraitView(TraitPage.BLEND_SHAPE);
      }
      // We already selected this trait, do nothing
      return
    }

    setIsPickingColor(false);
    setIsLoading(true);
    characterManager.loadTrait(trait.traitGroup.trait, trait.id).then(()=>{
      setIsLoading(false);
      if(trait.blendshapeTraits?.length>0){
        const selectedBlendshapeTrait = characterManager.getCurrentBlendShapeTraitData(trait.traitGroup.trait);
        setSelectedBlendshapeTraits(Object.entries(selectedBlendshapeTrait).reduce((acc,[key,value])=>{acc[key]=value.id;return acc},{}))
        setTraitView(TraitPage.BLEND_SHAPE);
      }
      setSelectedTrait(trait);
    })
  }
  const removeTrait = (traitGroupName) =>{
    setIsPickingColor(false);
    characterManager.removeTrait(traitGroupName);
    setSelectedTrait(null);
  }
  const randomTrait = (traitGroupName) =>{
    setIsPickingColor(false);
    setIsLoading(true);
    characterManager.loadRandomTrait(traitGroupName).then(()=>{
      setIsLoading(false);
      setSelectedTrait(characterManager.getCurrentTraitData(traitGroupName));
    })
    // set selected trait
  }
  const handleJsonDrop = (files) => {
    setIsPickingColor(false);
    const filesArray = Array.from(files);
    const jsonDataArray = [];
    const processFile = (file) => {
      return new Promise((resolve, reject) => {
        if (file && file.name.toLowerCase().endsWith('.json')) {
          const reader = new FileReader();

          // XXX Anata hack to display nft thumbs
          const thumbLocation = `${characterManager.manifestData?.getAssetsDirectory()}/anata/_thumbnails/t_${file.name.split('_')[0]}.jpg`;

          console.log(thumbLocation)
          reader.onload = function (e) {
            try {
              const jsonContent = JSON.parse(e.target.result);
              // XXX Anata hack to display nft thumbs
              jsonContent.thumb = thumbLocation;
              jsonDataArray.push(jsonContent);

              resolve(); // Resolve the promise when processing is complete
            } catch (error) {
              console.error("Error parsing the JSON file:", error);
              reject(error);
            }
          };
          reader.readAsText(file);
        }
      });
    };

    // Use Promise.all to wait for all promises to resolve
    Promise.all(filesArray.map(processFile))
    .then(() => {
      if (jsonDataArray.length > 0){
        // This code will run after all files are processed
        setJsonSelectionArray(jsonDataArray);
        setIsLoading(true);
        characterManager.loadTraitsFromNFTObject(jsonDataArray[0]).then(()=>{
          setIsLoading(false);
        })
      }
    })
    .catch((error) => {
      console.error("Error processing files:", error);
    });
  }

  const handleFilesDrop = async(files) => {
    const file = files[0];
    // Check if the file has the .fbx extension
    if (file && file.name.toLowerCase().endsWith('.fbx')) {
      handleAnimationDrop(file);
    } 
    if (file && (file.name.toLowerCase().endsWith('.png') || file.name.toLowerCase().endsWith('.jpg'))) {
      handleImageDrop(file);
    } 
    if (file && file.name.toLowerCase().endsWith('.vrm')) {
      handleVRMDrop(file);
    } 
    if (file && file.name.toLowerCase().endsWith('.json')) {
      handleJsonDrop(files);
    } 
  };

  const selectTraitGroup = (traitGroup) => {
    !isMute && playSound('optionClick');
    setIsPickingColor(false);
    if (selectedTraitGroup?.trait !== traitGroup.trait){
      setTraitView(TraitPage.TRAIT);
      setTraits(characterManager.getTraits(traitGroup.trait));
      setSelectedTraitGroup(traitGroup);

      const selectedT = characterManager.getCurrentTraitData(traitGroup.trait)
      const selectedBlendshapeTraits = characterManager.getCurrentBlendShapeTraitData(traitGroup.trait);

      setSelectedTrait(selectedT);
      setSelectedBlendshapeTraits(Object.entries(selectedBlendshapeTraits).reduce((acc,[key,value])=>{acc[key]=value.id;return acc},{}))

      setSelectedVRM(characterManager.getCurrentTraitVRM(traitGroup.trait))
      moveCamera({ targetY: traitGroup.cameraTarget.height, distance: traitGroup.cameraTarget.distance})
    }
    else{
      setTraits(null);
      setSelectedTraitGroup(null)
      setSelectedTrait(null);
      setSelectedBlendshapeTraits({})
      moveCamera({ targetY: 0.8, distance: 3.2 })
    }
  }




  const uploadTrait = () =>{
    setIsPickingColor(false);
    var input = document.createElement('input');
    input.type = 'file';
    input.accept=".vrm"
    if(!selectedTraitGroup){
      return console.error("Please select a trait group first")
    }
    input.onchange = e => { 
      var file = e.target.files[0]; 
      if (file.name.endsWith(".vrm")){
        const url = URL.createObjectURL(file);
        setIsLoading(true);
        characterManager.loadCustomTrait(selectedTraitGroup.trait,url).then(()=>{
          setIsLoading(false);
        })
      }
    }
    input.click();
  }

  const [leftPanelShowing, setLeftPanelShowing] = useState(false)
  const leftFeatures = [ 'Voice', 'Behaviors']
  const [selectedFeature, setSelectedFeature] = useState(null)

  const [isSelectingVoice, setIsSelectingVoice] = useState(false)
  const [isSelectingBehavior, setIsSelectingBehavior] = useState(false)


  const handleFeatureClick = (featureName) => {
    console.log("featureName", featureName)
    setSelectedFeature(featureName)
    if (featureName == 'Voice' ) {
        setIsSelectingBehavior(false)
        setIsSelectingVoice(!isSelectingVoice)
    }
    else if (featureName == 'Behaviors' )  {
        setIsSelectingVoice(false)
        setIsSelectingBehavior(!isSelectingBehavior)
    }
}

  useEffect(() => {
    console.log('group traits', characterManager.getGroupTraits())
  }, [])

  const voices = [
    {
      name: 'Voice1',
      image: 'ui/voice1.png',
      audio: 'sound/voice1.mp3',
      id: 'GBv7mTt0atIp3Br8iCZE'
    },
    {
      name: 'Voice2',
      image: 'ui/voice2.png',
      audio: 'sound/voice2.mp3',
      id: 'LcfcDJNUP1GQjkzn1xUU'

    },
    {
      name: 'Voice3',
      image: 'ui/voice3.png',
      audio: 'sound/voice3.mp3',
      id: 'EXAVITQu4vr4xnSDxMaL'
    },
  ]
  const [selectedVoice, setSelectedVoice] = useState(null)

  const handleVoiceSelect = (voice) => {
    setSelectedVoice(voice)
    // const audio = new Audio("data:audio/mp3;base64," + voice.audio);
    const audio = new Audio(voice.audio);
    audio.play();
  }

  const behaviors = [
    {
      name: 'Behavior1',
      path: 'ui/behavior1.png'
    },
    {
      name: 'Behavior2',
      path: 'ui/behavior2.png'
    },
    {
      name: 'Behavior3',
      path: 'ui/behavior3.png'
    }
  ]
  const [selectedBehavior, setSelectedBehavior] = useState(null)

  return (
    <div className={styles.container}>
      <div className={`loadingIndicator ${isLoading ? "active" : ""}`}>
        <img className={"rotate"} src="ui/loading.svg" />
      </div>
      {/* <div className={"sectionTitle"}>{t("pageTitles.chooseAppearance")}</div> */}
      <div className={styles["topMenu"]}>
        <div className={styles.topBox}>
          <img className={styles.bigIcon} src="ui/exit.svg" onClick={back} />
          <img className={styles.smallIcon} src="ui/problem.svg" />
        </div>
        <div className={styles.topBox}>
          <img className={styles.smallIcon} src="ui/prev.svg" />
          <img className={styles.smallIcon} src="ui/next.svg" />
          <img className={styles.bigIcon} src="ui/save.svg" />
        </div>
      </div>
      <FileDropComponent 
         onFilesDrop={handleFilesDrop}
      />
      {/* Main Menu section */}
      <div className={styles["sideMenu"]} >
        <div className={styles["sideMenuContent"]}>
          {leftPanelShowing &&  <div className={styles["leftMenuTitle"]}>
            Character
          </div>}
          <div className={styles["editor"]} style={{ transform: leftPanelShowing ? 'scaleY(1)' : 'scaleY(0.1)' }}>
            {leftPanelShowing && 
            <div className={styles["editor-container"]}>
              <div className={styles["editor-tab"]}>
              {
                leftFeatures.map((feature, index) => {
                  return (
                    <div key={"options_" + index} 
                         className={styles["editorButton"]}
                         onClick={() => handleFeatureClick(feature) }
                         style={{ backgroundImage: feature == selectedFeature? "url('ui/seleced_button_bg.png')" : ''}}
                  >
                      <div className={styles["editorText"]}>{feature}</div>
                    </div>
                  )})
              }
            </div>
            </div>
            }
          </div>
        </div>
      </div>
      <img className={styles["leftPanelTriggerIcon"]} src="ui/setting.svg" onClick={() => {setLeftPanelShowing(!leftPanelShowing)}} />


      {/* Option Selection section */
      selectedFeature !== null && (
        <div className={styles["selectorContainerPos"]}>
            {selectedFeature == "Voice" && 
              <div className={styles["scrollContainerOptions"]}>
                
                <div className={styles["selector-container"]}>
                  {/* All buttons section */
                  voices.map((voice) => {
                    let active = voice.name === selectedVoice?.name
                    return (
                      <div
                        key={voice.name}
                        className={`${styles["selectorButton"]}`}
                        onClick={()=>{handleVoiceSelect(voice)}}
                      >
                        <TokenBox
                          size={100}
                          icon={voice.image}
                          rarity={active ? "mythic" : "none"}   
                          style={{ maxWidth: '92%', maxHeight: '92%' }}   
                        />
                      </div>
                    )
                  })}
                </div>
              </div>}
            {selectedFeature == "Behaviors" && (
              <div className={styles["scrollContainerOptions"]}>
                
                <div className={styles["selector-container"]}>
                  {/* All buttons section */
                  behaviors.map((behavior) => {
                    let active = behavior.name === selectedBehavior?.name
                    return (
                      <div
                        key={behavior.name}
                        className={`${styles["selectorButton"]}`}
                        onClick={()=>{setSelectedBehavior(behavior)}}
                      >
                        <TokenBox
                          size={100}
                          icon={behavior.path}
                          rarity={active ? "mythic" : "none"}   
                          style={{ maxWidth: '95%', maxHeight: '95%' }}   
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
          

        
      )}
      <JsonAttributes jsonSelectionArray={jsonSelectionArray}/>
      
      <AnimationRightPanel selectedTrait={selectedTrait} selectedVRM={selectedVRM} traitGroupName={selectedTraitGroup?.trait||""}/>

      <TestAnimationBottomDisplayMenu loadedAnimationName={loadedAnimationName} randomize={randomize} selectedVoice={selectedVoice}/>
    </div>
  )
}

export default Test

/**
 * @param {{selectedTrait:ModelTrait|null,selectedBlendShapeTrait:Record<string,string>,onBack:()=>void,setSelectedBlendshapeTrait:(x:Record<string,string>)=>void}} param0 
 */
const BlendShapeTraitView = ({selectedTrait,onBack,selectedBlendShapeTrait,setSelectedBlendshapeTrait})=>{
  const {characterManager,moveCamera} = React.useContext(SceneContext);

  const groups = characterManager.getBlendShapeGroupTraits(selectedTrait?.traitGroup.trait||"",selectedTrait?.id||"");

  /**
   *
   * @param {string} traitGroup
   * @param {import('../library/CharacterManifestData.js').BlendShapeGroup} blendShapeGroupTrait 
    */
  const removeBlendShapeTrait = (traitGroup,blendShapeGroupTrait)=>{
    characterManager.removeBlendShapeTrait(traitGroup,blendShapeGroupTrait.trait);
    const blendShapeTraitCopy = {...selectedBlendShapeTrait};
    delete blendShapeTraitCopy[blendShapeGroupTrait.trait]
    setSelectedBlendshapeTrait(blendShapeTraitCopy);
  }
  /**
   * @param {import('../library/CharacterManifestData.js').BlendShapeTrait} newBlendShape 
   */
  const selectBlendShapeTrait = (newBlendShape)=>{
    const parent = newBlendShape.parentGroup;
    characterManager.loadBlendShapeTrait(selectedTrait?.traitGroup.trait||"",parent.trait||"",newBlendShape?.id||'');
    moveCamera({ targetY: parent.cameraTarget.height, distance: parent.cameraTarget.distance})
    const blendShapeTraitCopy = {...selectedBlendShapeTrait};
    blendShapeTraitCopy[parent.trait||''] = newBlendShape.id;
    setSelectedBlendshapeTrait(blendShapeTraitCopy);
  }

  return (
    <div className={styles["selector-container-column"]}>
        <CustomButton
          theme="dark"
          text={"Back"}
          size={14}
          className={styles.buttonLeft}
          onClick={onBack}
        />
        {groups && groups.length > 0 && groups.map((group)=>{
          return (
            <div key={group.trait} className={styles.blendshapeGroup}> 
              <div>{group.name}</div>
              <div className={styles["selector-container"]} >
                <BlendShapeItem key={"empty"}
                    src={cancel}
                    active={!selectedBlendShapeTrait[group.trait]}
                    blendshapeID="cancel"
                    select={()=>removeBlendShapeTrait(selectedTrait.traitGroup.trait,group)}
                    />
                {group.collection.map((blendShapeTrait)=>{
                  let active = blendShapeTrait.id === selectedBlendShapeTrait[group.trait]
                  return (
                    <BlendShapeItem key={blendShapeTrait.id} src={blendShapeTrait.fullThumbnail||''} active={active} blendshapeID={blendShapeTrait.id} select={()=>selectBlendShapeTrait(blendShapeTrait)}/>
                  )
                })}
              </div>

            </div>
          )
        })}
    </div>
  )
}

/**
 * @param {{active:boolean,blendshapeID:string,src:string,select:()=>void}} param0 
 */
const BlendShapeItem = ({active,blendshapeID,src,select})=>{

  return (
    <div
      key={blendshapeID}
      className={`${styles["selectorButton"]}`}
      onClick={select}
    >
      <TokenBox
        size={100}
        icon={src||''}
        rarity={active ? "mythic" : "none"}      
      />
    </div>
  )
}