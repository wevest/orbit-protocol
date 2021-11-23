import "module-alias/register";
import { ADDRESS_ZERO } from "../utils/constants";
import { BigNumber } from "ethers";

const hre = require("hardhat");
const WETH9Compiled = require("../external/abi/weth/WETH9.json");
const UNICompiled = require("../external/abi/uniswap/v2/Uni.json");
const UniswapV2PairCompiled = require("../external/abi/uniswap/v2/UniswapV2Pair.json");
const UniswapV2FactoryCompiled = require("../external/abi/uniswap/v2/UniswapV2Factory.json");
const UniswapV2Router02Compiled = require("../external/abi/uniswap/v2/UniswapV2Router02.json");

async function main(): Promise<void> {
  const accounts = await hre.ethers.getSigners();

  /**
   * Core Smart Contract Deployment Start
   */
  // We get the contract to deploy
  const Controller = await hre.ethers.getContractFactory("Controller");
  const controller = await Controller.deploy(accounts[0].address);

  await controller.deployed();

  console.log("Controller deployed to:", controller.address);

  await controller.initialize([], [], [], []);

  console.log("Controller is initialized");

  const IntegrationRegistry = await hre.ethers.getContractFactory("IntegrationRegistry");
  const integrationRegistry = await IntegrationRegistry.deploy(controller.address);

  await integrationRegistry.deployed();

  console.log("IntegrationRegistry deployed to:", integrationRegistry.address);

  const INTEGRATION_REGISTRY_RESOURCE_ID = 0;
  await controller.addResource(integrationRegistry.address, INTEGRATION_REGISTRY_RESOURCE_ID);

  console.log("IntegrationRegistry added to controller as resource");

  const PriceOracle = await hre.ethers.getContractFactory("PriceOracle");
  const priceOracle = await PriceOracle.deploy(controller.address, ADDRESS_ZERO, [], [], [], []);

  await priceOracle.deployed();

  console.log("PriceOracle deployed to:", priceOracle.address);

  const SetValuer = await hre.ethers.getContractFactory("SetValuer");
  const setValuer = await SetValuer.deploy(controller.address);

  await setValuer.deployed();

  console.log("SetValuer deployed to:", setValuer.address);

  const ProtocolViewer = await hre.ethers.getContractFactory("ProtocolViewer");
  const protocolViewer = await ProtocolViewer.deploy();

  await protocolViewer.deployed();

  console.log("ProtocolViewer deployed to:", protocolViewer.address);

  const AmmModule = await hre.ethers.getContractFactory("AmmModule");
  const ammModule = await AmmModule.deploy(controller.address);

  await ammModule.deployed();

  console.log("AmmModule deployed to:", ammModule.address);

  await controller.addModule(ammModule.address);

  console.log("AmmModule added to controller");

  const BasicIssuanceModule = await hre.ethers.getContractFactory("BasicIssuanceModule");
  const basicIssuanceModule = await BasicIssuanceModule.deploy(controller.address);

  await basicIssuanceModule.deployed();

  console.log("BasicIssuanceModule deployed to:", basicIssuanceModule.address);

  await controller.addModule(basicIssuanceModule.address);

  console.log("BasicIssuanceModule added to controller");

  const StreamingFeeModule = await hre.ethers.getContractFactory("StreamingFeeModule");
  const streamingFeeModule = await StreamingFeeModule.deploy(controller.address);

  await streamingFeeModule.deployed();

  console.log("StreamingFeeModule deployed to:", streamingFeeModule.address);

  await controller.addModule(streamingFeeModule.address);

  console.log("StreamingFeeModule added to controller");

  const WETH9 = await hre.ethers.getContractFactory(WETH9Compiled.abi, WETH9Compiled.bytecode);
  const weth = await WETH9.deploy();

  await weth.deployed();

  console.log("WETH deployed to:", weth.address);

  await weth.deposit({value: '10000000000000000000000'});
  console.log("Deposited ETH for WETH");

  var wethBalance = await weth.balanceOf(accounts[0].address);
  console.log(`User WETH Balance: ${wethBalance}`);

  /**
   * NavIssuanceModule
   */
  const NavIssuanceModule = await hre.ethers.getContractFactory("NavIssuanceModule");
  const navIssuanceModule = await NavIssuanceModule.deploy(controller.address, weth.address);

  await navIssuanceModule.deployed();

  console.log("NavIssuanceModule deployed to:", navIssuanceModule.address);

  await controller.addModule(navIssuanceModule.address);

  console.log("NavIssuanceModule added to controller");

  /**
   * TradeModule
   */
  const TradeModule = await hre.ethers.getContractFactory("TradeModule");
  const tradeModule = await TradeModule.deploy(controller.address);

  await tradeModule.deployed();

  console.log("TradeModule deployed to:", tradeModule.address);

  await controller.addModule(tradeModule.address);

  console.log("TradeModule added to controller");

  /**
   * WrapModule
   */
  const WrapModule = await hre.ethers.getContractFactory("WrapModule");
  const wrapModule = await WrapModule.deploy(controller.address, weth.address);

  await wrapModule.deployed();

  console.log("WrapModule deployed to:", wrapModule.address);

  await controller.addModule(wrapModule.address);

  console.log("WrapModule added to controller");

  /**
   * GovernanceModule
   */
  const GovernanceModule = await hre.ethers.getContractFactory("GovernanceModule");
  const governanceModule = await GovernanceModule.deploy(controller.address);

  await governanceModule.deployed();

  console.log("GovernanceModule deployed to:", governanceModule.address);

  await controller.addModule(governanceModule.address);

  console.log("GovernanceModule added to controller");

  /**
   * DebtIssuanceModule
   */
  const DebtIssuanceModule = await hre.ethers.getContractFactory("DebtIssuanceModule");
  const debtIssuanceModule = await DebtIssuanceModule.deploy(controller.address);

  await debtIssuanceModule.deployed();

  console.log("DebtIssuanceModule deployed to:", debtIssuanceModule.address);

  await controller.addModule(debtIssuanceModule.address);

  console.log("DebtIssuanceModule added to controller");

  /**
   * GeneralIndexModule
   */
  const GeneralIndexModule = await hre.ethers.getContractFactory("GeneralIndexModule");
  const generalIndexModule = await GeneralIndexModule.deploy(controller.address, weth.address);

  await generalIndexModule.deployed();

  console.log("GeneralIndexModule deployed to:", generalIndexModule.address);

  await controller.addModule(generalIndexModule.address);

  console.log("GeneralIndexModule added to controller");

  /**
   * CustomOracleNavIssuanceModule
   */
  const CustomOracleNavIssuanceModule = await hre.ethers.getContractFactory("CustomOracleNavIssuanceModule");
  const customOracleNavIssuanceModule = await CustomOracleNavIssuanceModule.deploy(controller.address, weth.address);

  await customOracleNavIssuanceModule.deployed();

  console.log("CustomOracleNavIssuanceModule deployed to:", customOracleNavIssuanceModule.address);

  await controller.addModule(customOracleNavIssuanceModule.address);

  console.log("CustomOracleNavIssuanceModule added to controller");

  /**
   * DebtIssuanceModuleV2
   */
  const DebtIssuanceModuleV2 = await hre.ethers.getContractFactory("DebtIssuanceModuleV2");
  const debtIssuanceModuleV2 = await DebtIssuanceModuleV2.deploy(controller.address);

  await debtIssuanceModuleV2.deployed();

  console.log("DebtIssuanceModuleV2 deployed to:", debtIssuanceModuleV2.address);

  await controller.addModule(debtIssuanceModuleV2.address);

  console.log("DebtIssuanceModuleV2 added to controller");

  /**
   * AaveLeverageModule
   */
  /*const AaveLeverageModule = await hre.ethers.getContractFactory("AaveLeverageModule");
  const aaveLeverageModule = await AaveLeverageModule.deploy(controller.address, weth.address);

  await aaveLeverageModule.deployed();

  console.log("AaveLeverageModule deployed to:", aaveLeverageModule.address);

  await controller.addModule(aaveLeverageModule.address);

  console.log("AaveLeverageModule added to controller");*/

  /**
   * CompoundLeverageModule
   */
  /*const CompoundLeverageModule = await hre.ethers.getContractFactory("CompoundLeverageModule");
  const compoundLeverageModule = await CompoundLeverageModule.deploy(controller.address);

  await compoundLeverageModule.deployed();

  console.log("CompoundLeverageModule deployed to:", compoundLeverageModule.address);

  await controller.addModule(compoundLeverageModule.address);

  console.log("CompoundLeverageModule added to controller");*/

  var blockNum = await hre.ethers.provider.getBlockNumber();
  var block = await hre.ethers.provider.getBlock(blockNum);
  var timestamp = block.timestamp;
  const UNI = await hre.ethers.getContractFactory(UNICompiled.abi, UNICompiled.bytecode);
  const uni = await UNI.deploy(accounts[0].address, accounts[0].address, timestamp + 60000);

  await uni.deployed();

  console.log("UNI deployed to:", uni.address);

  var uniBalance = await uni.balanceOf(accounts[0].address);
  console.log(`User UNI Balance: ${uniBalance}`);

  const UniswapV2Factory = await hre.ethers.getContractFactory(UniswapV2FactoryCompiled.abi, UniswapV2FactoryCompiled.bytecode);
  const uniswapV2Factory = await UniswapV2Factory.deploy(accounts[0].address);

  await uniswapV2Factory.deployed();

  console.log("UniswapV2Factory deployed to:", uniswapV2Factory.address);

  const UniswapV2Router02 = await hre.ethers.getContractFactory(UniswapV2Router02Compiled.abi, UniswapV2Router02Compiled.bytecode);
  const uniswapV2Router02 = await UniswapV2Router02.deploy(uniswapV2Factory.address, weth.address);

  await uniswapV2Router02.deployed();

  console.log("UniswapV2Router02 deployed to:", uniswapV2Router02.address);

  await weth.approve(uniswapV2Router02.address, '1000000000000000000');

  console.log("UniswapV2Router02 approved to spend WETH");

  await uni.approve(uniswapV2Router02.address, '120000000000000000000');

  console.log("UniswapV2Router02 approved to spend UNI");

  blockNum = await hre.ethers.provider.getBlockNumber();
  block = await hre.ethers.provider.getBlock(blockNum);
  timestamp = block.timestamp;
  var receipt = await uniswapV2Router02.addLiquidity(weth.address, uni.address, '1000000000000000000', '120000000000000000000',
    '1000000000000000000', '120000000000000000000', accounts[0].address, timestamp + 1200000);

  console.log("Liquidity added in tx: ", receipt.hash);

  const UniswapV2AmmAdapter = await hre.ethers.getContractFactory("UniswapV2AmmAdapter");
  const uniswapV2AmmAdapter = await UniswapV2AmmAdapter.deploy(uniswapV2Router02.address);

  await uniswapV2AmmAdapter.deployed();

  console.log("UniswapV2AmmAdapter deployed to:", uniswapV2AmmAdapter.address);

  const integrationName = "UNISWAPV2AMM";
  await integrationRegistry.addIntegration(ammModule.address, integrationName, uniswapV2AmmAdapter.address);

  console.log("UniswapV2AmmAdapter integration added");

  const SetTokenCreator = await hre.ethers.getContractFactory("SetTokenCreator");
  const setTokenCreator = await SetTokenCreator.deploy(controller.address);

  await setTokenCreator.deployed();

  console.log("SetTokenCreator deployed to:", setTokenCreator.address);

  await controller.addFactory(setTokenCreator.address);

  console.log("SetTokenCreator added to controller");

  receipt = await setTokenCreator.create([weth.address, uni.address],
    ['1000000000000000000', '120000000000000000000'],
    [ammModule.address, basicIssuanceModule.address], accounts[0].address, "Kelly ETH Set", "KETH", [BigNumber.from(50), BigNumber.from(50)]);

  console.log("SetToken has been created in tx: ", receipt.hash);

  const result = await receipt.wait();
  const setAddr = result.events.find((obj: { event: string; }) => obj.event === "SetTokenCreated").args[0];
  console.log(`SetToken deployed to: ${setAddr}`);

  const setToken = await hre.ethers.getContractAt("SetToken", setAddr);
  const name = await setToken.name();
  const symbol = await setToken.symbol();
  console.log(`${symbol}: ${name}`);

  await basicIssuanceModule.initialize(setToken.address, hre.ethers.constants.AddressZero);
  console.log(`BasicIssuanceModule initialized for SetToken`);

  await ammModule.initialize(setToken.address);
  console.log(`AmmModule initialized for SetToken`);

  wethBalance = await weth.balanceOf(accounts[0].address);
  console.log(`User WETH Balance: ${wethBalance}`);

  uniBalance = await uni.balanceOf(accounts[0].address);
  console.log(`User UNI Balance: ${uniBalance}`);

  wethBalance = await weth.balanceOf(setToken.address);
  console.log(`SetToken WETH Balance: ${wethBalance}`);

  uniBalance = await uni.balanceOf(setToken.address);
  console.log(`SetToken UNI Balance: ${uniBalance}`);

  var [addresses, amounts] = await basicIssuanceModule.getRequiredComponentUnitsForIssue(setToken.address, '1000000000000000000');
  const wethAmount = addresses[0] == weth.address ? amounts[0] : amounts[1];
  const uniAmount = addresses[1] == uni.address ? amounts[1] : amounts[0];

  console.log(`WETH: ${wethAmount} UNI: ${uniAmount}`);

  await weth.approve(basicIssuanceModule.address, wethAmount);
  console.log("BasicIssuanceModule approved to spend WETH");

  await uni.approve(basicIssuanceModule.address, uniAmount);
  console.log("BasicIssuanceModule approved to spend UNI");

  await basicIssuanceModule.issue(setToken.address, '1000000000000000000', accounts[0].address);
  console.log('SetToken issued');

  wethBalance = await weth.balanceOf(setToken.address);
  console.log(`SetToken WETH Balance: ${wethBalance}`);

  uniBalance = await uni.balanceOf(setToken.address);
  console.log(`SetToken UNI Balance: ${uniBalance}`);

  const pair = await uniswapV2Factory.getPair(weth.address, uni.address);
  console.log(`Pair Address: ${pair}`);

  const uniswapV2Pair = await await hre.ethers.getContractAt(UniswapV2PairCompiled.abi, pair);

  var totalSupply = await uniswapV2Pair.totalSupply();
  console.log("UniswapV2Pair totalSupply:", totalSupply.toString());

  var [reserve0, reserve1, ] = await uniswapV2Pair.getReserves();
  console.log(`UniswapV2Pair reserve0: ${reserve0.toString()} reserve1: ${reserve1.toString()}`);

  const token0 = await uniswapV2Pair.token0();
  const token1 = await uniswapV2Pair.token1();
  const wethReserve = token0 == weth.address ? reserve0 : reserve1;
  const uniReserve = token1 == uni.address ? reserve1 : reserve0;

  console.log(`token0: ${token0 == weth.address ? "WETH" : "UNI"} ${wethReserve} token1: ${token1 == uni.address ? "UNI" : "WETH"} ${uniReserve}`);

  var liquidity0 = totalSupply.mul(wethAmount).div(wethReserve);
  var liquidity1 = totalSupply.mul(uniAmount).div(uniReserve);
  var liquidity = liquidity0 < liquidity1 ? liquidity0 : liquidity1;

  await ammModule.addLiquidity(setToken.address, integrationName, pair, liquidity.toString(),
    [weth.address, uni.address], [wethAmount, uniAmount]);

  console.log(`SetToken added liquidity. Expected: ${liquidity}`);

  wethBalance = await weth.balanceOf(setToken.address);
  console.log(`SetToken WETH Balance: ${wethBalance}`);

  uniBalance = await uni.balanceOf(setToken.address);
  console.log(`SetToken UNI Balance: ${uniBalance}`);

  let pairBalance = await uniswapV2Pair.balanceOf(setToken.address);
  console.log(`SetToken LP Balance: ${pairBalance}`);

  [addresses, amounts] = await basicIssuanceModule.getRequiredComponentUnitsForIssue(setToken.address, '1000000000000000000');
  console.log(`${addresses} ${amounts}`);

  await ammModule.removeLiquidity(setToken.address, integrationName, pair, liquidity.toString(),
    [weth.address, uni.address], [wethAmount, uniAmount]);

  console.log(`SetToken removed liquidity. Expected: WETH: ${wethAmount} UNI: ${uniAmount}`);

  wethBalance = await weth.balanceOf(setToken.address);
  console.log(`SetToken WETH Balance: ${wethBalance}`);

  uniBalance = await uni.balanceOf(setToken.address);
  console.log(`SetToken UNI Balance: ${uniBalance}`);

  pairBalance = await uniswapV2Pair.balanceOf(setToken.address);
  console.log(`SetToken LP Balance: ${pairBalance}`);

  [addresses, amounts] = await basicIssuanceModule.getRequiredComponentUnitsForIssue(setToken.address, '1000000000000000000');
  console.log(`${addresses} ${amounts}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
