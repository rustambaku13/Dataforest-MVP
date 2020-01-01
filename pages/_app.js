import React, { useEffect } from 'react';
import Head from 'next/head';
import nextCookie from 'next-cookies';
import axios from 'axios';
import { Provider } from 'react-redux';
import Navigation from '../components/Navigation';
import { makestore } from '../store';
import withRedux from "next-redux-wrapper";
import 'antd/dist/antd.css';
import '../static/styles/index.scss';
import { getUserInfo } from '../services/user';
import { setAuthUser } from '../actions';

function MyApp({ Component, pageProps, store, token }) {
  // Set common header to axios if token is valid
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common = { 'Authorization': `Token ${token}` };
    }
  }, []);

  return (
    <Provider store={store}>
      <Head>
        <link rel="stylesheet" href="/static/css/style.css" />
        <link rel="stylesheet" href="/static/css/themify-icons.css" />
      </Head>

      <Navigation />
      <Component {...pageProps} />
    </Provider>
  )
}

MyApp.getInitialProps = async (props) => {
  const { Component, ctx } = props;
  let pageProps = {};

  // call getInitialProps if any
  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(ctx);
  }

  const { token } = nextCookie(ctx);

  const data = await getUserInfo(token);
  ctx.store.dispatch(setAuthUser(data));

  return { pageProps, token: data ? token : null };
}

export default withRedux(makestore)(MyApp);