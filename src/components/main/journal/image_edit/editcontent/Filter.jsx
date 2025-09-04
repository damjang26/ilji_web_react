import React, {useState, useEffect, useCallback} from 'react';
import * as fabric from 'fabric';
import {
    FilterContainer,
    FilterPresetList,
    FilterPresetButton,
    FilterSliderContainer,
    FilterSlider,
    FilterLabel, ResetButton
} from "../../../../../styled_components/main/journal/JournalWriteStyled.jsx";

// 미리 정의해 둘 필터 목록
const PRESET_FILTERS = [
    {name: 'Original', type: 'None'},
    {name: 'Grayscale', type: 'Grayscale'},
    {name: 'Sepia', type: 'Sepia'},
    {name: 'Vintage', type: 'Vintage'},
    {name: 'Kodachrome', type: 'Kodachrome'},
    {name: 'Polaroid', type: 'Polaroid'},
    {name: 'Invert', type: 'Invert'},
];

const Filter = ({canvas}) => {
    // 현재 활성화된 프리셋 필터를 추적하는 상태
    const [activePreset, setActivePreset] = useState('None');

    // 슬라이더로 조절 가능한 필터들의 상태
    const [brightness, setBrightness] = useState(0);
    const [contrast, setContrast] = useState(0);
    const [saturation, setSaturation] = useState(0);
    // 컴포넌트가 처음 마운트될 때, 저장된 상태를 불러오기 전에
    // 기본값으로 필터를 덮어쓰는 것을 방지하기 위한 플래그입니다.
    const [isInitialized, setIsInitialized] = useState(false);

    // 컴포넌트가 마운트될 때, 이미지 객체에 저장된 필터 상태를 불러옵니다.
    // 이렇게 하면 탭을 전환했다가 돌아와도 필터 설정이 유지됩니다.
    useEffect(() => {
        if (!canvas) return;
        const image = canvas.getObjects()[0];
        if (image && image.type === 'image' && image.customFilterState) {
            const {activePreset, brightness, contrast, saturation} = image.customFilterState;
            setActivePreset(activePreset || 'None');
            setBrightness(brightness || 0);
            setContrast(contrast || 0);
            setSaturation(saturation || 0);
        }
        // 상태 복원이 완료되었음을 표시합니다.
        setIsInitialized(true);
    }, [canvas]);

    // 필터를 적용하는 핵심 로직 (useCallback으로 불필요한 재실행 방지)
    const applyFilters = useCallback(() => {
        if (!canvas) return;

        // 캔버스에서 배경 이미지를 찾습니다. (보통 첫 번째 객체)
        const image = canvas.getObjects()[0];
        if (!image || image.type !== 'image') return;

        // 새로운 필터를 적용하기 전에 기존 필터를 모두 제거합니다.
        image.filters = [];

        // 1. 프리셋 필터 적용 (직접 import한 클래스를 사용하도록 변경)
        switch (activePreset) {
            case 'Grayscale':
                image.filters.push(new fabric.filters.Grayscale());
                break;
            case 'Sepia':
                image.filters.push(new fabric.filters.Sepia());
                break;
            case 'Vintage':
                image.filters.push(new fabric.filters.Vintage());
                break;
            case 'Kodachrome':
                image.filters.push(new fabric.filters.Kodachrome());
                break;
            case 'Polaroid':
                image.filters.push(new fabric.filters.Polaroid());
                break;
            case 'Invert':
                image.filters.push(new fabric.filters.Invert());
                break;
            default:
                // 'None' 또는 다른 경우에는 아무것도 하지 않습니다.
                break;
        }

        // 2. 슬라이더 필터 적용 (값이 0이 아닐 때만)
        if (brightness !== 0) image.filters.push(new fabric.filters.Brightness({brightness}));
        if (contrast !== 0) image.filters.push(new fabric.filters.Contrast({contrast}));
        if (saturation !== 0) image.filters.push(new fabric.filters.Saturation({saturation}));

        // 현재 필터 상태를 이미지 객체에 직접 저장하여 유지시킵니다.
        image.customFilterState = {
            activePreset,
            brightness,
            contrast,
            saturation,
        };

        // 필터를 이미지에 적용하고 캔버스를 다시 렌더링합니다.
        image.applyFilters();
        canvas.renderAll();
    }, [canvas, activePreset, brightness, contrast, saturation]);

    // 필터 관련 상태가 변경될 때마다 필터 적용 함수를 실행합니다.
    useEffect(() => {
        // 초기 상태 복원이 완료된 후에만 필터를 적용합니다.
        if (isInitialized) {
            applyFilters();
        }
    }, [applyFilters, isInitialized]);

    // 프리셋 버튼 클릭 핸들러
    const handlePresetClick = (presetType) => {
        // 프리셋을 선택하면 슬라이더 값들은 초기화합니다.
        setBrightness(0);
        setContrast(0);
        setSaturation(0);
        setActivePreset(presetType);
    };

    // 슬라이더 값 변경 핸들러
    const handleSliderChange = (setter) => (e) => {
        // 슬라이더를 움직여도 UI 레이아웃은 그대로 유지됩니다.
        setter(parseFloat(e.target.value));
    };

    // 모든 조절 값을 초기화하는 함수
    const resetAll = () => {
        handlePresetClick('None');
    };

    // 슬라이더 값이 하나라도 변경되었는지 확인하여 '커스텀' 상태인지 판단합니다.
    const isAdjusted = brightness !== 0 || contrast !== 0 || saturation !== 0;
    const selectedFilter = PRESET_FILTERS.find(f => f.type === activePreset);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.key === "Delete" || e.key === "Backspace") && canvas) {
                const activeObject = canvas.getActiveObject();
                if (activeObject) {
                    canvas.remove(activeObject);
                    canvas.discardActiveObject();
                    canvas.requestRenderAll();
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [canvas]);

    return (
        <FilterContainer>
            <FilterLabel>Preset Filters</FilterLabel>
            <FilterPresetList>
                {activePreset === 'None' ? (
                    // 1. 초기 상태: 모든 프리셋 버튼을 보여줍니다.
                    PRESET_FILTERS.map(({name, type}) => (
                        <FilterPresetButton key={name} $active={false} onClick={() => handlePresetClick(type)}>
                            {name}
                        </FilterPresetButton>
                    ))
                ) : (
                    // 2. 필터 선택 후: 선택된 필터 버튼만 보여줍니다.
                    // 이 버튼을 클릭하면 초기 상태(필터 목록)로 돌아갑니다.
                    <FilterPresetButton $active={!isAdjusted} onClick={resetAll}>
                        {selectedFilter?.name || 'Custom'}
                    </FilterPresetButton>
                )}
            </FilterPresetList>

            {/* 3. 필터가 선택된 경우에만 슬라이더와 리셋 버튼을 보여줍니다. */}
            {activePreset !== 'None' && (
                <>
                    <FilterLabel>Adjustments</FilterLabel>
                    <FilterSliderContainer>
                        <span>Brightness</span>
                        <FilterSlider type="range" min="-0.3" max="0.3" step="0.01" value={brightness}
                                      onChange={handleSliderChange(setBrightness)}/>
                    </FilterSliderContainer>
                    <FilterSliderContainer>
                        <span>Contrast</span>
                        <FilterSlider type="range" min="-0.3" max="0.3" step="0.01" value={contrast}
                                      onChange={handleSliderChange(setContrast)}/>
                    </FilterSliderContainer>
                    <FilterSliderContainer>
                        <span>Saturation</span>
                        <FilterSlider type="range" min="-1" max="1" step="0.01" value={saturation}
                                      onChange={handleSliderChange(setSaturation)}/>
                    </FilterSliderContainer>

                    <ResetButton onClick={resetAll}>Reset All</ResetButton>
                </>
            )}
        </FilterContainer>
    );
};

export default Filter;
