import styled from 'styled-components';

export const GeneratorWrapper = styled.div`
    display: flex;
    flex-direction: column;
    font-size: 14px;
    gap: 12px;
    padding: 10px;
    background-color: #f9f9f9;
    border-radius: 6px;
    border: 1px solid #eee;
`;

export const Row = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
`;

export const Select = styled.select`
    padding: 6px 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
    flex-grow: 1;
`;

export const DayButtonGroup = styled.div`
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
`;

export const DayButton = styled.button`
    width: 32px;
    height: 32px;
    border: 1px solid ${({ $isSelected }) => ($isSelected ? '#007bff' : '#ccc')};
    background-color: ${({ $isSelected }) => ($isSelected ? '#007bff' : 'white')};
    color: ${({ $isSelected }) => ($isSelected ? 'white' : '#333')};
    border-radius: 50%;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    transition: all 0.2s ease-in-out;

    &:hover {
        border-color: #007bff;
    }
`;

export const Section = styled.div`
    padding-top: 12px;
    margin-top: 12px;
    border-top: 1px solid #eee;
`;

export const InputRow = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

export const SmallInput = styled.input`
    width: 60px;
    padding: 6px 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    text-align: center;
`;

export const RadioGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

export const RadioLabel = styled.label`
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
`;

export const RadioInput = styled.input.attrs({ type: 'radio' })`
    cursor: pointer;
    /* 브라우저 기본 스타일을 사용 */
`;

export const ClickableInputWrapper = styled.div`
    display: inline-flex;
    gap: 4px;
    align-items: center;
`;