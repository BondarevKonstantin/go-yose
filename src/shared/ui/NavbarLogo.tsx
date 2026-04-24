import { Apostrophe, B, K, Logo, Name, PersMark, S } from './navbar.styles';

export const NavbarLogo = () => {
  return (
    <Logo>
      <PersMark>
        <B>B</B>
        <K>K</K>
        <Apostrophe>'</Apostrophe>
        <S>s</S>
      </PersMark>
      <Name>YoseTrainer</Name>
    </Logo>
  );
};
