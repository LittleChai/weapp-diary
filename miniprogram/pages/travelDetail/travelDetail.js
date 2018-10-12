Page({

  /**
   * 页面的初始数据
   */
  data: {
    travelObj: {},
    likeBol: false,
    travelId: '',
    userData: '',
    likeArr: []
  },
  // 查看大图
  showImg(e) {
    let index = e.currentTarget.dataset.index;
    let copy = this.data.travelObj;

    wx.previewImage({
      urls: copy.data.list[index].imgs,
      current: e.currentTarget.dataset.url,
      success: function (res) {
        console.log(res)
      }
    })
  },
  // 初始化点赞图标
  initLikeArr() {
    let copy = this.data.userData.likeArr;
    let copy1 = this.data.travelObj;
    let arr = this.data.likeArr;
    let bol = false;
    // console.log(copy)
    if (copy.length == 0) {
      // for (var i = 0; i < copy1.length; i++) {
        arr[0] = 0;
      // }
    } 
    else {
      // for (var i = 0; i < copy1.length; i++) {
        bol = copy.some(function (item, index) {
          if (copy1['_id'] == item) {
            arr[0] = 1;
            return true;
          } else {
            arr[0] = 0;
            return false;
          }
        })
      // }
    }
    // console.log(arr);

    this.setData({
      likeArr: arr
    })

  },
  addLike(e) {
    // console.log(e);
    // let id = e.currentTarget.dataset.id;
    let index = 0;
    let copy = this.data.userData.likeArr;
    let copy1 = this.data.travelObj;
    let pushId;
    let haveIndex = 0;
    let res;
    if (copy.length == 0) {
      pushId = copy1['_id']
      res = false;
    } 
    else {
      res = copy.some(function (item, index) {
        if (item == copy1['_id']) {
          console.log(index)
          haveIndex = index;
          return true;
        } else {
          pushId = copy1['_id']
          return false;
        }
      })
    }

    if (!res) {
      copy.push(pushId);
      let travelCopy = this.data.travelObj.data.like;
      travelCopy += 1;
      copy1.data.like = travelCopy;
      this.setData({
        travelObj: copy1
      })

      this.sqlChange(index, copy, 'like', 'add')
    }
    else {
      copy.splice(haveIndex, 1);

      let travelCopy = this.data.travelObj.data.like;
      travelCopy -= 1;
      copy1.data.like = travelCopy;
      this.setData({
        travelObj: copy1
      })

      this.sqlChange(index, copy, 'like', 'min')
    };

    // console.log(copy)

    let copyAll = this.data.userData;
    copyAll.likeArr = copy;


    this.setData({
      userData: copyAll
    })
    this.initLikeArr();

  },
  sqlChange(val, arr, types, what) {
    console.log(val, arr, types, what)
    let id = this.data.travelObj['_id'];
    let openid = wx.getStorageSync('openid');
    // console.log(id)

    let db = wx.cloud.database();
    let _ = db.command;

    if (types == 'like') {

      wx.cloud.callFunction({
        name: 'userArr',
        data: {
          openid: openid,
          arr: 'like',
          arrs: arr
        }
      })
      if (what == 'add') {
        db.collection('travel').doc(id).update({
          data: {
            data: {
              like: _.inc(1)
            }
          },
          success(res) {
            console.log(res)
          }
        });
      }
      else {
        db.collection('travel').doc(id).update({
          data: {
            data: {
              like: _.inc(-1)
            }
          },
          success(res) {
            console.log(res)
          }
        });
      }
    }
    else if (types == 'star') {
      wx.cloud.callFunction({
        name: 'userArr',
        data: {
          openid: openid,
          arr: 'star',
          arrs: arr
        }
      })

      if (what == 'add') {
        db.collection('travel').doc(id).update({
          data: {
            data: {
              star: _.inc(1)
            }
          },
          success(res) {
            console.log(res)
          }
        });
      }
      else {
        db.collection('travel').doc(id).update({
          data: {
            data: {
              star: _.inc(-1)
            }
          },
          success(res) {
            console.log(res)
          }
        });
      }
    }

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    // console.log(options.id)

    let myid = options.id;
    this.setData({
      travelId: myid
    })
    // let myid = 'W725rd2AWotkbRXB';
    let db = wx.cloud.database();
    let _ = db.command;
    db.collection('travel').doc(myid).update({
      data: {
        data: {
          see: _.inc(1)
        }
      },
      success(res) {
        console.log(res)
      }
    });

    that.initData(myid);
    that.initUser();

  },
  initData(myid) {
    let that = this;
    let db = wx.cloud.database();
    // let _ = db.command;
    let travelData = db.collection('travel').where({
      _id: myid
    }).get();

    var mydata;

    var a = Promise.resolve(travelData).then(function (res) {
      mydata = res.data[0]
      console.log(mydata, res.data);
      that.setData({
        travelObj: mydata
      })
      // console.log(that.data.travelObj)
      wx.setNavigationBarTitle({
        title: that.data.travelObj.data.title
      })
    })


  },
  initUser() {
    let that = this;
    let openid = wx.getStorageSync('openid')
    let db = wx.cloud.database();

    // let _ = db.command;
    let userData1 = db.collection('users').where({
      _openid: openid
    }).get();

    var mydata;
    Promise.resolve(userData1).then(function (res) {
      mydata = res.data[0]
      // console.log(res.data[0]);
      that.setData({
        userData: mydata
      });
      that.initLikeArr();
      // that.initStarArr();
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})