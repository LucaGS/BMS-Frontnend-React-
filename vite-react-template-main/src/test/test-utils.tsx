import React, { type PropsWithChildren } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

type RouterOptions = {
  route?: string;
  path?: string;
};

const RouterWrapper: React.FC<PropsWithChildren<RouterOptions>> = ({
  children,
  route = '/',
  path = '/',
}) => (
  <MemoryRouter initialEntries={[route]}>
    <Routes>
      <Route path={path} element={children} />
    </Routes>
  </MemoryRouter>
);

export const renderWithRouter = (
  ui: React.ReactElement,
  options: RouterOptions = {},
  renderOptions?: Omit<RenderOptions, 'wrapper'>
) =>
  render(ui, {
    wrapper: ({ children }) => (
      <RouterWrapper route={options.route} path={options.path}>
        {children}
      </RouterWrapper>
    ),
    ...renderOptions,
  });

export * from '@testing-library/react';
