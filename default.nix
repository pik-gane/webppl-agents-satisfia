{ pkgs ? import <nixpkgs> { } }:
with pkgs;
let
  node = nodejs-18_x;
in
mkShell {
  name = "env";
  buildInputs = [
    nodePackages.typescript-language-server
    python3
    # nodePackages.prettier
    # nodePackages.eslint
    node
  ];
  LD_LIBRARY_PATH = lib.makeLibraryPath (with pkgs; [
    libuuid
  ]);
}
