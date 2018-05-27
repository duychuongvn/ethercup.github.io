import Vue from 'vue'
import Vuex from 'vuex'
import Web3 from 'web3'

Vue.use(Vuex)

// root state object.
// each Vuex instance is just a single state tree.
const state = {
  web3: null,
  provider: '',
  account: '',
  balance: 0,
  currentNetwork: 0,
  targetNetwork: 0,
  registry: {
    address: '',
    contract: null,
    instance: null
  }
}


const mutations = {
  // used with store.commit('increment')
  // state always first argument, n is payload
  initWeb3 (state) {
    if (typeof(window.web3) !== 'undefined') {
      state.provider = window.web3.currentProvider
      state.web3 = new Web3(state.provider)
    } else {
      console.log('Please install the MetaMask browser plugin to proceed')
    }
  },
  setCurrentNetwork (state, network) {
    state.currentNetwork = network
  },
  setTargetNetwork (state, network) {
    state.targetNetwork = network
  },
  setAccount (state, account) {
    state.account = account
  },
  setBalance (state, balance) {
    state.balance = balance
  }

}

// actions are functions that cause side effects and can involve
// asynchronous operations.
const actions = {
  updateCurrentNetwork (context) {
    context.state.web3.eth.net.getId().then(network => {
      if (context.state.network != network) {
        context.commit('setCurrentNetwork', network)  
      }
    })
  },
  updateAccount (context) {
    context.state.web3.eth.getAccounts().then(accounts => {
      if (accounts !== undefined &&
          accounts.length > 0 &&
          accounts[0].toLowerCase() != context.state.account)
      {
          context.commit('setAccount', accounts[0].toLowerCase())
          context.dispatch('updateBalance')
      }
    })
  },
  updateBalance (context) {
    if(context.state.web3.utils.isAddress(context.state.account)) {
      context.state.web3.eth.getBalance(context.state.account).then(balance => {
          context.state.balance = Number(context.state.web3.utils.fromWei(balance)).toFixed(3)
      })
    }
  }
}

// getters are functions
const getters = {
  getWeb3: state => state.web3,
  hasMetamask: state => {
    return state.web3 !== 'undefined'
  },
  isSignedInMetamask: state => {
    return state.account != ''
  },
  isUsingCorrectNetwork: state => {
    return state.currentNetwork == state.targetNetwork
  },
  isMetamaskNetworkLoginReady: (state, getters) => {
    return getters.hasMetamask &&
      getters.isSignedInMetamask &&
      getters.isUsingCorrectNetwork
  }
}

export default new Vuex.Store({
  state,
  getters,
  actions,
  mutations
})