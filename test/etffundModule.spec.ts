import "module-alias/register";
import Web3 from "web3";
import { BigNumber } from "ethers";
// import { utils } from "ethers";
// import { ethers } from "hardhat";

import { Address } from "@utils/types";
import { Account } from "@utils/test/types";
import {
  KyberExchangeAdapter,
  KyberNetworkProxyMock,
  OneInchExchangeAdapter,
  OneInchExchangeMock,
  SetToken,
  StandardTokenMock,
  TradeModule,
  ETFFundModule,
  UniswapV2ExchangeAdapter,
  UniswapV2TransferFeeExchangeAdapter,
  UniswapV2ExchangeAdapterV2,
  // WETH9,
  ZeroExApiAdapter,
  ZeroExMock,
  UniswapV3ExchangeAdapter, CustomOracleNavIssuanceModule,
} from "@utils/contracts";
// import { EMPTY_BYTES } from "@utils/constants";
import DeployHelper from "@utils/deploys";
import {
  ether,
} from "@utils/index";
import {
  cacheBeforeEach,
  getAccounts,
  getRandomAccount,
  getSystemFixture,
  getUniswapFixture,
  getUniswapV3Fixture,
  getWaffleExpect,
} from "@utils/test/index";

import { SystemFixture, UniswapFixture, UniswapV3Fixture } from "@utils/fixtures";

const web3 = new Web3();
const expect = getWaffleExpect();

describe("ETFFundModule", () => {
  let owner: Account;
  let manager: Account;
  // eslint-disable-next-line no-unused-vars
  let mockModule: Account;

  let deployer: DeployHelper;

  let kyberNetworkProxy: KyberNetworkProxyMock;
  let kyberExchangeAdapter: KyberExchangeAdapter;
  let kyberAdapterName: string;

  let oneInchExchangeMock: OneInchExchangeMock;
  let oneInchExchangeAdapter: OneInchExchangeAdapter;
  let oneInchAdapterName: string;

  let uniswapExchangeAdapter: UniswapV2ExchangeAdapter;
  let uniswapAdapterName: string;
  let uniswapTransferFeeExchangeAdapter: UniswapV2TransferFeeExchangeAdapter;
  let uniswapTransferFeeAdapterName: string;
  let uniswapExchangeAdapterV2: UniswapV2ExchangeAdapterV2;
  let uniswapAdapterV2Name: string;
  let uniswapV3ExchangeAdapter: UniswapV3ExchangeAdapter;
  let uniswapV3AdapterName: string;

  let zeroExMock: ZeroExMock;
  let zeroExApiAdapter: ZeroExApiAdapter;
  let zeroExApiAdapterName: string;

  let wbtcRate: BigNumber;
  let setup: SystemFixture;
  let uniswapSetup: UniswapFixture;
  let uniswapV3Setup: UniswapV3Fixture;
  let tradeModule: TradeModule;
  let etffundModule: ETFFundModule;
  let customOracleNavIssuanceModule: CustomOracleNavIssuanceModule;

  cacheBeforeEach(async () => {
    [
      owner,
      manager,
      mockModule,
    ] = await getAccounts();

    deployer = new DeployHelper(owner.wallet);
    setup = getSystemFixture(owner.address);
    await setup.initialize();

    wbtcRate = ether(33); // 1 WBTC = 33 ETH

    // Mock Kyber reserve only allows trading from/to WETH
    kyberNetworkProxy = await deployer.mocks.deployKyberNetworkProxyMock(setup.weth.address);
    await kyberNetworkProxy.addToken(
      setup.wbtc.address,
      wbtcRate,
      8
    );
    kyberExchangeAdapter = await deployer.adapters.deployKyberExchangeAdapter(kyberNetworkProxy.address);

    // Mock OneInch exchange that allows for only fixed exchange amounts
    oneInchExchangeMock = await deployer.mocks.deployOneInchExchangeMock(
      setup.wbtc.address,
      setup.weth.address,
      BigNumber.from(100000000), // 1 WBTC
      wbtcRate, // Trades for 33 WETH
    );

    // 1inch function signature
    const oneInchFunctionSignature = web3.eth.abi.encodeFunctionSignature(
      "swap(address,address,uint256,uint256,uint256,address,address[],bytes,uint256[],uint256[])"
    );
    oneInchExchangeAdapter = await deployer.adapters.deployOneInchExchangeAdapter(
      oneInchExchangeMock.address,
      oneInchExchangeMock.address,
      oneInchFunctionSignature
    );

    uniswapSetup = getUniswapFixture(owner.address);
    await uniswapSetup.initialize(
      owner,
      setup.weth.address,
      setup.wbtc.address,
      setup.dai.address
    );

    uniswapV3Setup = getUniswapV3Fixture(owner.address);
    await uniswapV3Setup.initialize(
      owner,
      setup.weth,
      2500,
      setup.wbtc,
      35000,
      setup.dai
    );

    uniswapExchangeAdapter = await deployer.adapters.deployUniswapV2ExchangeAdapter(uniswapSetup.router.address);
    uniswapTransferFeeExchangeAdapter = await deployer.adapters.deployUniswapV2TransferFeeExchangeAdapter(uniswapSetup.router.address);
    uniswapExchangeAdapterV2 = await deployer.adapters.deployUniswapV2ExchangeAdapterV2(uniswapSetup.router.address);
    uniswapV3ExchangeAdapter = await deployer.adapters.deployUniswapV3ExchangeAdapter(uniswapV3Setup.swapRouter.address);

    zeroExMock = await deployer.mocks.deployZeroExMock(
      setup.wbtc.address,
      setup.weth.address,
      BigNumber.from(100000000), // 1 WBTC
      wbtcRate, // Trades for 33 WETH
    );
    zeroExApiAdapter = await deployer.adapters.deployZeroExApiAdapter(zeroExMock.address, setup.weth.address);


    kyberAdapterName = "KYBER";
    oneInchAdapterName = "ONEINCH";
    uniswapAdapterName = "UNISWAP";
    uniswapTransferFeeAdapterName = "UNISWAP_TRANSFER_FEE";
    uniswapAdapterV2Name = "UNISWAPV2";
    zeroExApiAdapterName = "ZERO_EX";
    uniswapV3AdapterName = "UNISWAPV3";

    etffundModule = await deployer.modules.deployETFFundModule(setup.controller.address, setup.usdc.address);
    await setup.controller.addModule(etffundModule.address);

    tradeModule = await deployer.modules.deployTradeModule(setup.controller.address);
    await setup.controller.addModule(tradeModule.address);

    customOracleNavIssuanceModule = await deployer.modules.deployCustomOracleNavIssuanceModule(setup.controller.address, setup.weth.address);
    await setup.controller.addModule(customOracleNavIssuanceModule.address);

    await setup.integrationRegistry.batchAddIntegration(
      [
        tradeModule.address,
        tradeModule.address,
        tradeModule.address,
        tradeModule.address,
        tradeModule.address,
        tradeModule.address,
        tradeModule.address,
      ],
      [
        kyberAdapterName,
        oneInchAdapterName,
        uniswapAdapterName,
        uniswapTransferFeeAdapterName,
        uniswapAdapterV2Name,
        zeroExApiAdapterName,
        uniswapV3AdapterName,
      ],
      [
        kyberExchangeAdapter.address,
        oneInchExchangeAdapter.address,
        uniswapExchangeAdapter.address,
        uniswapTransferFeeExchangeAdapter.address,
        uniswapExchangeAdapterV2.address,
        zeroExApiAdapter.address,
        uniswapV3ExchangeAdapter.address,
      ]
    );
  });

  describe("#constructor", async () => {
    let subjectETFFundModule: ETFFundModule;

    async function subject(): Promise<ETFFundModule> {
      return deployer.modules.deployETFFundModule(setup.controller.address, setup.usdc.address);
    }

    it("should have the correct controller", async () => {
      subjectETFFundModule = await subject();
      const expectedController = await subjectETFFundModule.controller();
      expect(expectedController).to.eq(setup.controller.address);
    });
  });

  context("when there is a deployed SetToken with enabled TradeModule", async () => {
    let sourceToken: StandardTokenMock;
    let wbtcUnits: BigNumber;
    let wethUnits: BigNumber;
    let destinationToken: StandardTokenMock;
    let setToken: SetToken;

    cacheBeforeEach(async () => {
      // Selling WBTC
      sourceToken = setup.usdc; // UNI token
      destinationToken = setup.dai; // Comp token
      wbtcUnits = ether(1); // 1 WBTC in base units 1 * 10 ** 8
      wethUnits = ether(1);

      // Create Set token
      setToken = await setup.createSetToken(
        [sourceToken.address, destinationToken.address],
        [wbtcUnits, wethUnits],
        [setup.issuanceModule.address, etffundModule.address, tradeModule.address, customOracleNavIssuanceModule.address],
        [BigNumber.from(50), BigNumber.from(50)],
        manager.address
      );
    });

    describe("#initialize", async () => {
      let subjectSetToken: Address;
      let subjectCaller: Account;

      beforeEach(async () => {
        subjectSetToken = setToken.address;
        subjectCaller = manager;
      });

      async function subject(): Promise<any> {
        etffundModule = etffundModule.connect(subjectCaller.wallet);
        return etffundModule.initialize(subjectSetToken);
      }

      it("should enable the Module on the SetToken", async () => {
        await subject();
        const isModuleEnabled = await setToken.isInitializedModule(etffundModule.address);
        expect(isModuleEnabled).to.eq(true);
      });

      describe("when the caller is not the SetToken manager", async () => {
        beforeEach(async () => {
          subjectCaller = await getRandomAccount();
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Must be the SetToken manager");
        });
      });

      describe("when the module is not pending", async () => {
        beforeEach(async () => {
          await subject();
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Must be pending initialization");
        });
      });

      describe("when the SetToken is not enabled on the controller", async () => {
        beforeEach(async () => {
          const nonEnabledSetToken = await setup.createNonControllerEnabledSetToken(
            [setup.dai.address],
            [ether(1)],
            [etffundModule.address],
            [BigNumber.from(50), BigNumber.from(50)],
            manager.address
          );

          subjectSetToken = nonEnabledSetToken.address;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Must be controller-enabled SetToken");
        });
      });
    });

    describe("#buy", async () => {
      // let sourceTokenQuantity: BigNumber;
      let isInitialized: boolean;

      // let subjectDestinationToken: Address;
      // let subjectSourceToken: Address;
      // let subjectSourceQuantity: BigNumber;
      // let subjectAdapterName: string;
      // let subjectSetToken: Address;
      // let subjectMinDestinationQuantity: BigNumber;
      // let subjectData: Bytes;
      // let subjectCaller: Account;

      context("when buy a SetToken", async () => {
        before (async () => {
          isInitialized = true;
        });

        const initializeContracts = async () => {
          // Initialize module if set to true
          if (isInitialized) {
            etffundModule = etffundModule.connect(manager.wallet);
            await etffundModule.initialize(setToken.address);
            tradeModule = tradeModule.connect(manager.wallet);
            await tradeModule.initialize(setToken.address);
          }
        };

        const initializeSubjectVariables = () => {
          // subjectSourceToken = sourceToken.address;
          // subjectDestinationToken = destinationToken.address;
          // subjectSourceQuantity = sourceTokenQuantity;
          // subjectSetToken = setToken.address;
          // subjectData = EMPTY_BYTES;
          // subjectCaller = manager;
        };

        describe("when the module is initialized", () => {
          cacheBeforeEach(initializeContracts);
          beforeEach(initializeSubjectVariables);

          it ("Buying selected ETF", async () => {
            etffundModule = etffundModule.connect(manager.wallet);
            // Approve to spend USDC coin in ETFfundModule
            await setup.usdc.mint(manager.wallet.address, ether(5000));
            await setup.usdc.connect(manager.wallet).approve(etffundModule.address, ether(100));

            // Buying setToken with approved USDC coin
            const tx = await etffundModule.connect(manager.wallet).buy(setToken.address, ether(100));
            await tx.wait();
            const test = await etffundModule.get_test();
            console.log(test);
            // console.log(ethers.utils.formatEther(test[0]));
            // console.log(ethers.utils.formatEther(test[1]));
          });
        });
      });
    });

    describe("#removeModule", async () => {
      let subjectModule: Address;

      beforeEach(async () => {
        etffundModule = etffundModule.connect(manager.wallet);
        await etffundModule.initialize(setToken.address);

        subjectModule = etffundModule.address;
      });

      async function subject(): Promise<any> {
        setToken = setToken.connect(manager.wallet);
        return setToken.removeModule(subjectModule);
      }

      it("should remove the module", async () => {
        await subject();
        const isModuleEnabled = await setToken.isInitializedModule(etffundModule.address);
        expect(isModuleEnabled).to.eq(false);
      });
    });
  });
});

