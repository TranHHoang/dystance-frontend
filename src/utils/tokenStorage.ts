import keytar from "keytar";

export const saveToken = async (userName: string, token: string, refreshToken: string) => {
  await keytar.setPassword(
    "Dystance",
    userName,
    JSON.stringify({
      token: token,
      refreshToken: refreshToken
    })
  );
};

export const getToken = async (userName: string): Promise<{ token: string; refreshToken: string }> =>
  JSON.parse(await keytar.getPassword("Dystance", userName));
