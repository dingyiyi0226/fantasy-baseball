import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { apis, getToken } from './apis.js';

function Home() {
  let [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const auth_code = searchParams.get('code');

    const fetchMetadata = async () => {
      await getToken(auth_code);
      const league = await apis.getMetadata();
      console.log('league', league);
    }

    fetchMetadata();

  }, [searchParams]);

  return (
    <div>asdf</div>
  )

}

export default Home;
