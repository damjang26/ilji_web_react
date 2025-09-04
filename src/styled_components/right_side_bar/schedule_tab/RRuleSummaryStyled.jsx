import styled from 'styled-components';

export const SummaryWrapper = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s ease-in-out;
    font-size: 14px;
    color: #333;

    &:hover {
        background-color: #f9f9f9;
    }
`;

export const SummaryText = styled.span`
    flex-grow: 1;
`;

export const ChevronIcon = styled.span`
    color: #888;
    font-size: 12px;
`;