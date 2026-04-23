import styled from 'styled-components';

export const Page = styled.div`
  min-height: calc(100vh - 56px);
  background: #f3f4f6;
  display: flex;
  justify-content: center;
  padding: 40px 20px;
`;

export const Layout = styled.div`
  width: 100%;
  max-width: 1200px;
  display: grid;
  grid-template-columns: 480px 380px;
  gap: 32px;
  align-items: flex-start;
`;

export const Card = styled.div`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  padding: 20px;
`;

export const PanelStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const Panel = styled.div`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 16px;
`;

export const PanelTitle = styled.div`
  font-weight: 600;
  margin-bottom: 12px;
`;

export const Label = styled.div`
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 6px;
`;

export const Button = styled.button`
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #374151;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    background: #f9fafb;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

export const PrimaryButton = styled(Button)`
  width: 100%;
  padding: 10px;
  border: none;
  background: #4b5563;
  color: #ffffff;

  &:hover:not(:disabled) {
    background: #374151;
  }
`;

export const Field = styled.input`
  width: 100%;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
`;

export const Select = styled.select`
  width: 100%;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
`;

export const SegmentedControl = styled.div`
  display: flex;
  background: #f3f4f6;
  border-radius: 12px;
  padding: 4px;
  gap: 4px;
  margin-bottom: 12px;
`;

export const SegmentButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 8px 10px;
  border-radius: 10px;
  border: none;
  background: ${({ $active }) => ($active ? '#ffffff' : 'transparent')};
  box-shadow: ${({ $active }) => ($active ? '0 1px 2px rgba(0, 0, 0, 0.08)' : 'none')};
  cursor: pointer;
  font-weight: ${({ $active }) => ($active ? 600 : 500)};
  color: ${({ $active }) => ($active ? '#111827' : '#6b7280')};
  transition: all 0.15s ease;
`;
