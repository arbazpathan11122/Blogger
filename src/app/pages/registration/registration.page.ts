import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { IonSlides, ActionSheetController } from '@ionic/angular';
import { AlertService } from 'src/app/service/alert.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.page.html',
  styleUrls: ['./registration.page.scss'],
})
export class RegistrationPage implements OnInit {
  @ViewChild(IonSlides, { static: false }) slides: IonSlides;
  sameTimeForAll: boolean;
  curentDay = 0;
  slidesOpts = {
    pagination: false,
    // onlyExternal: false,
    on: {
      beforeInit() {
        const swiper = this;
        swiper.classNames.push(`${swiper.params.containerModifierClass}flip`);
        swiper.classNames.push(`${swiper.params.containerModifierClass}3d`);
        const overwriteParams = {
          slidesPerView: 1,
          slidesPerColumn: 1,
          slidesPerGroup: 1,
          watchSlidesProgress: true,
          spaceBetween: 0,
          virtualTranslate: true,
        };
        swiper.params = Object.assign(swiper.params, overwriteParams);
        swiper.originalParams = Object.assign(swiper.originalParams, overwriteParams);
      },
      setTranslate() {
        const swiper = this;
        // tslint:disable-next-line: no-shadowed-variable
        const { $, slides, rtlTranslate: rtl } = swiper;
        for (let i = 0; i < slides.length; i += 1) {
          const $slideEl = slides.eq(i);
          let progress = $slideEl[0].progress;
          if (swiper.params.flipEffect.limitRotation) {
            progress = Math.max(Math.min($slideEl[0].progress, 1), -1);
          }
          const offset$$1 = $slideEl[0].swiperSlideOffset;
          const rotate = -180 * progress;
          let rotateY = rotate;
          let rotateX = 0;
          let tx = -offset$$1;
          let ty = 0;
          if (!swiper.isHorizontal()) {
            ty = tx;
            tx = 0;
            rotateX = -rotateY;
            rotateY = 0;
          } else if (rtl) {
            rotateY = -rotateY;
          }

          $slideEl[0].style.zIndex = -Math.abs(Math.round(progress)) + slides.length;

          if (swiper.params.flipEffect.slideShadows) {
            // Set shadows
            // tslint:disable-next-line: max-line-length
            let shadowBefore = swiper.isHorizontal() ? $slideEl.find('.swiper-slide-shadow-left') : $slideEl.find('.swiper-slide-shadow-top');
            // tslint:disable-next-line: max-line-length
            let shadowAfter = swiper.isHorizontal() ? $slideEl.find('.swiper-slide-shadow-right') : $slideEl.find('.swiper-slide-shadow-bottom');
            if (shadowBefore.length === 0) {
              shadowBefore = swiper.$(`<div class="swiper-slide-shadow-${swiper.isHorizontal() ? 'left' : 'top'}"></div>`);
              $slideEl.append(shadowBefore);
            }
            if (shadowAfter.length === 0) {
              shadowAfter = swiper.$(`<div class="swiper-slide-shadow-${swiper.isHorizontal() ? 'right' : 'bottom'}"></div>`);
              $slideEl.append(shadowAfter);
            }
            if (shadowBefore.length) { shadowBefore[0].style.opacity = Math.max(-progress, 0); }
            if (shadowAfter.length) { shadowAfter[0].style.opacity = Math.max(progress, 0); }
          }
          $slideEl
            .transform(`translate3d(${tx}px, ${ty}px, 0px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
        }
      },
      setTransition(duration) {
        const swiper = this;
        const { slides, activeIndex, $wrapperEl } = swiper;
        slides
          .transition(duration)
          .find('.swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left')
          .transition(duration);
        if (swiper.params.virtualTranslate && duration !== 0) {
          let eventTriggered = false;
          // eslint-disable-next-line
          slides.eq(activeIndex).transitionEnd(function onTransitionEnd() {
            if (eventTriggered) { return; }
            if (!swiper || swiper.destroyed) { return; }

            eventTriggered = true;
            swiper.animating = false;
            const triggerEvents = ['webkitTransitionEnd', 'transitionend'];
            // tslint:disable-next-line: prefer-for-of
            for (let i = 0; i < triggerEvents.length; i += 1) {
              $wrapperEl.trigger(triggerEvents[i]);
            }
          });
        }
      }
    }
  };
  RestaurantId: any;
  restaurantDetail: any = {};
  foodType = {
    veg: false,
    nonVeg: false,
    both: true,
    jain: true,
  };
  paymentOption = {
    cash: true,
    credit: false,
    paytm: false,
    upi: true,
  };

  openOn = [

    {
      day: 'Monday',
      isOpen: true,
      open: '',
      close: ''
    },
    {
      day: 'Tuesday',
      isOpen: true,
      open: '',
      close: ''
    },
    {
      day: 'Wednesday',
      isOpen: true,
      open: '',
      close: ''
    },
    {
      day: 'Thursday',
      isOpen: true,
      open: '',
      close: ''
    },
    {
      day: 'Friday',
      isOpen: true,
      open: '',
      close: ''
    },
    {
      day: 'Saturday',
      isOpen: true,
      open: '',
      close: ''
    },
    {
      day: 'Sunday',
      isOpen: true,
      open: '',
      close: ''
    },
  ];

  restType = {
    cafe: false,
    restaurant: true,
    both: false,
  };
  parking = true;
  restCapacity = 10;
  restCost = 50;
  aboutRestaurant: string;
  active: any;

  // openOn: any;
  selectedDayTime: any = {};
  userDetails: any = {};
  email = '';

  constructor(
    @Inject(ActivatedRoute) private activatedRoute: ActivatedRoute,
    @Inject(AlertService) private alertService: AlertService,
    public actionSheetController: ActionSheetController,

  ) {
    this.subscribeRouteChanges();
    // this.alertService.showLoader('Loading...');
  }

  ngOnInit() {
    // this.photoService.loadSaved();

    // this.slides.lockSwipes(true);
  }

  next() {
    this.slides.lockSwipes(false);
    this.slides.slideNext();
    this.slides.lockSwipes(true);
  }

  previous() {
    this.slides.lockSwipes(false);
    this.slides.slidePrev();
    this.slides.lockSwipes(true);
  }


  subscribeRouteChanges() {



  }
  getRestaurantById(id) {

  }


  saveRestName() {
    if (this.restaurantDetail.name === '') {
      this.alertService.showErrorAlert('Please Enter the Restaurant Name');
      return;
    }
    this.next();

  }
  saveFoodType() {
    // tslint:disable-next-line: no-string-literal
    this.restaurantDetail['foodType'] = this.foodType;
    this.next();
  }

  saveRestType() {
    // tslint:disable-next-line: no-string-literal
    this.restaurantDetail['restType'] = this.restType;
    this.next();
  }

  savePaymentType() {
    // tslint:disable-next-line: no-string-literal

    if (!(this.paymentOption.cash || this.paymentOption.credit || this.paymentOption.paytm || this.paymentOption.upi)) {
      this.alertService.showErrorAlert('Please Select Payment Option');
      return;
    }
    // tslint:disable-next-line: no-string-literal
    this.restaurantDetail['paymentOption'] = this.paymentOption;
    this.next();
  }

  saveParking() {
    // tslint:disable-next-line: no-string-literal
    this.restaurantDetail['parking'] = this.parking;
    this.next();
  }

  saveAboutRestaurant() {
    // tslint:disable-next-line: no-string-literal
    this.restaurantDetail['aboutRestaurant'] = this.aboutRestaurant;
    this.next();

  }

  SaveRestCapacity() {
    // tslint:disable-next-line: no-string-literal
    this.restaurantDetail['restCapacity'] = this.restCapacity;
    this.next();
  }

  saveCost() {

    // tslint:disable-next-line: no-string-literal
    this.restaurantDetail['restCost'] = this.restCost;
    this.next();
  }


  addClass(val) {
    // tslint:disable-next-line: object-literal-key-quotes

    if (val === 'veg') {
      this.foodType.veg = true;
      this.foodType.nonVeg = false;
      this.foodType.both = false;
      console.log(this.foodType);
      // tslint:disable-next-line: object-literal-key-quotes
      // $('#vegColor').css({ 'backgroundColor': '#03fa033d' });

      return;
    }
    if (val === 'nonVeg') {
      this.foodType.veg = false;
      this.foodType.nonVeg = true;
      this.foodType.both = false;
      this.foodType.jain = false;
      console.log(this.foodType);
      // tslint:disable-next-line: object-literal-key-quotes
      // $('#vegColor').css({ 'backgroundColor': '#f4433630' });

      return;

    }
    if (val === 'both') {
      this.foodType.veg = false;
      this.foodType.nonVeg = false;
      this.foodType.both = true;
      console.log(this.foodType);
      // tslint:disable-next-line: object-literal-key-quotes
      // $('#vegColor').css({ 'backgroundColor': '#f7faba61' });

      return;

    }

  }

  addClassInRestType(val) {
    for (const key in this.restType) {

      if (key === val) {
        this.restType[key] = true;


      } else {

        this.restType[key] = false;
      }


    }
  }

  // for day selection
  selectDays() {
    const days = this.openOn.filter(element => element.isOpen);

    this.selectedDayTime = days[0];
    this.next();
  }


  sendDay(day) {
    delete this.selectedDayTime;

    this.selectedDayTime = day;
  }


  setSametimeForAll(val) {
    if (!val) {
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.openOn.length; i++) {
        if (this.openOn[i].isOpen) {

          this.openOn[i].open = this.selectedDayTime.open;
          this.openOn[i].close = this.selectedDayTime.close;
        }

      }
    }

  }

  saveOpeningDaysANdTime() {

    // tslint:disable-next-line: no-string-literal
    this.restaurantDetail['customOpencloseTimeing'] = this.openOn;
  }


  checkForRequiredFieldOnDay() {
    let er = 0;
    this.openOn.forEach(element => {
      if ((element.isOpen)) {
        if (((element.open === '') || (element.close === ''))) {
          er++;
        }
      }
    });

    if (er > 0) {
      this.alertService.showErrorAlert('Please Set Time For all Day');

    } else {
      this.next();
      this.saveOpeningDaysANdTime();
    }
  }
  openTime(val) {
    if (val) {
      this.openOn[this.curentDay].open = val;

    }

  }
  closeTime(val) {
    if (val) {
      this.openOn[this.curentDay].close = val;

    }

  }

  showDetails() {
    this.alertService.showLoader('Please Wait Uploading Data ..');

    // this.SetUserData().then(() => {
    //   // if (this.email.length > 2) {
    //   //   if (this.userDetails.emailVerified) {
    //   //     this.slides.slideTo(13, 10);
    //   //   } else {
    //   //     this.slides.slideTo(12, 10);

    //   //   }
    //   // } else {

    //   //   this.slides.slideTo(11, 10);
    //   // }
    //   this.next();
    //   console.log('goto thanks page');
    //   this.alertService.closeLoader();
    // }, (error) => {
    //   this.alertService.closeLoader();

    // });

  }
  // saveImg() {
  //   if (this.photoService.photoList.indoorSpace.length < 1) {
  //     this.alertService.showErrorAlert('Please Upload indoor Image');
  //     return;
  //   }

  //   if (this.photoService.photoList.outdoorSpace.length < 1) {
  //     this.alertService.showErrorAlert('Please Upload Outdoor Image');
  //     return;
  //   }
  //   if (this.photoService.photoList.food.length < 1) {
  //     this.alertService.showErrorAlert('Please Upload Food Image');
  //     return;
  //   }
  //   if (this.photoService.photoList.menuPhoto.length < 1) {
  //     this.alertService.showErrorAlert('Please Upload Menu Image');
  //     return;
  //   }
  //   console.log(this.photoService.photoList);

  //   // tslint:disable-next-line: no-string-literal
  //   this.restaurantDetail['restImg'] = this.photoService.photoList;
  //   this.showDetails();
  // }

  // SetUserData() {

  //   // const userDetails = JSON.parse(localStorage.getItem('user'));
  //   this.userDetails.Restaurant = this.restaurantDetail;
  //   const userRef: AngularFirestoreDocument<any> = this.firestore.doc(`users/${this.userDetails.uid}`);

  //   return userRef.set(JSON.parse(JSON.stringify(this.userDetails)), {
  //     merge: true
  //   });
  // }


  isValidEmail() {
    const reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

    if (reg.test(this.email) === false) {
      // alert('Invalid Email Address');
      return false;
    }

    return true;

  }



  async presentActionSheetForCamera(val) {
    console.log(val);

    const actionSheet = await this.actionSheetController.create({
      header: 'Albums',
      buttons: [{
        text: 'Take Picture',
        // role: 'destructive',
        icon: 'camera',
        handler: () => {

          // this.photoService.takePictureFromCamera(val);
        }
      }, {
        text: 'Gallery',
        // role: 'destructive',
        icon: 'images',
        handler: () => {

          // this.photoService.takePictureFromGalry(val);
        }
      }, {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }]
    });
    await actionSheet.present();
  }

}
