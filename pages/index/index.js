//index.js
//获取应用实例
const app = getApp()
const audio = wx.getBackgroundAudioManager()

let currentPage = 0 // 当前第几页,0代表第一页 
let pageSize = 10 //每页显示多少数据 

Page({
  data: {
    src: '',
    playingID: 0,
    playing: false,
    userInfo: {},
    hasUserInfo: false,

    pods: [],
    loadMore: false, //"上拉加载"的变量，默认false，隐藏  
    loadAll: false, //“没有数据”的变量，默认false，隐藏  
    playtime: 0
  },

  //加载数据
  onLoad: function(e) {
    this.onQuery()

    // 用户在系统音乐播放面板点击上一曲事件（iOS only）
    audio.onPrev(function(e) {
      console.log('onPrev:', e)
    })

    // 用户在系统音乐播放面板点击下一曲事件（iOS only）
    audio.onNext(function(e) {
      console.log('onPrev:', e)
    })

    audio.onError(function(e) {
      const info = 'Sorry 播放错误'
      wx.showToast({
        title: info,
        icon: 'none',
        duration: 1000
      })
      console.log('onNext:', e)
    })

    audio.onTimeUpdate(function(e) {
      // console.log(audio.currentTime)
      //记录一下播放时长
    })
  },


  //页面上拉触底事件的处理函数
  onReachBottom: function() {
    console.log("上拉触底事件")
    let that = this
    if (!that.data.loadMore) {
      that.setData({
        loadMore: true, //加载中  
        loadAll: false //是否加载完所有数据
      });
      //加载更多，这里做下延时加载
      that.onQuery()
    }
  },


  onQuery: function() {
    let that = this;
    //第一次加载数据
    if (currentPage == 1) {
      this.setData({
        loadMore: true, //把"上拉加载"的变量设为true，显示  
        loadAll: false //把“没有数据”设为false，隐藏  
      })
    }
    //云数据的请求
    wx.cloud.database().collection("Podcasts")
      .skip(currentPage * pageSize) //从第几个数据开始
      .limit(pageSize)
      .orderBy('podcastID', 'desc')
      .get().then(res => {
        if (res.data && res.data.length > 0) {
          console.log("请求成功", res.data)
          currentPage++
          //把新请求到的数据添加到dataList里  
          let list = that.data.pods.concat(res.data)
          that.setData({
            pods: list, //获取数据数组    
            loadMore: false //把"上拉加载"的变量设为false，显示  
          });
          if (res.data.length < pageSize) {
            that.setData({
              loadMore: false, //隐藏加载中。。
              loadAll: true //所有数据都加载完了
            });
          }
          console.log("数据取了")
          console.log(this.data.pods)
        } else {
          that.setData({
            loadAll: true, //把“没有数据”设为true，显示  
            loadMore: false //把"上拉加载"的变量设为false，隐藏  
          })
        }
      })

  },


  //播放音频 
  audioPlay: function(event) {
    //点击打开页面格式格式是行不通的，没权限暂时不做

    if (this.data.playing == true && this.data.playingID != event.currentTarget.dataset.pid) {
      //audio.stop()
      audio.src = event.currentTarget.dataset.mp.trim()
      audio.title = event.currentTarget.dataset.title
      audio.singer = event.currentTarget.dataset.host
      this.setData({
        playing: true
      })
    } else if (this.data.playing == true && this.data.playingID == event.currentTarget.dataset.pid) {
      audio.pause()
      console.log("暂停")
      this.setData({
        playing: false
      })
    } else if (this.data.playing == false && this.data.playingID == event.currentTarget.dataset.pid) {
      audio.play()
      console.log("恢复播放")
      this.setData({
        playing: true
      })
    }else {
      audio.src = event.currentTarget.dataset.mp.trim()
      audio.title = event.currentTarget.dataset.title
      audio.singer = event.currentTarget.dataset.host
     // audio.play()
      console.log("播放")
      this.setData({
        playing: true
      })

    }

    this.setData({
      playingID: event.currentTarget.dataset.pid
    })
    console.log(this.data.playingID)
    console.log(this.data.playing)
  },


  //点击信息icon获取相关公众号信息
  clickinfo: function(event) {
    const bid1 = event.currentTarget.dataset.bid
    const info = '节目收录于\t\n' + bid1 + '公众号文章'
    wx.showToast({
      title: info,
      icon: 'none',
      duration: 2000
    })
  },

  //分享
  onShareAppMessage: function() {
    return {
      title: '    ',
      desc: '',
      path: '/page/index'
    }
  }

})