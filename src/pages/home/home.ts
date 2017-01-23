import {Component, NgZone} from '@angular/core';
import {NavController, AlertController} from 'ionic-angular';
import {PouchDBProvider} from "../../providers/pouchdb-provider";
import * as Uuid from "uuid";


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  public items: Array<any>;

  public constructor(public navCtrl: NavController, public alertCtrl: AlertController, private pouchdbProvider: PouchDBProvider, private zone: NgZone) {
    this.items = [];

  }

  public ionViewDidEnter() {
    this.pouchdbProvider.syncData();
    this.pouchdbProvider.getChangeListener().subscribe(data => {
      for (let i = 0; i < data.change.docs.length; i++) {
        this.zone.run(() => {
          this.items.push(data.change.docs[i]);
        });
      }
    });
    this.pouchdbProvider.fetch().then(result => {
      this.items = [];
      for (let i = 0; i < result.rows.length; i++) {
        this.items.push(result.rows[i].doc);
      }
    }, error => {
      console.error(error);
    });

  }

  public deleteDoc(id: string, itemID) {
    this.pouchdbProvider.remove(id);
    let index = this.items.indexOf(itemID, 0);
    if (index > -1) {
      this.items.splice(index, 1);
    }
  }

  public insert() {
    let prompt = this.alertCtrl.create({
      title: 'Add item',
      message: "Add a new item to the list",
      inputs: [
        {
          name: 'title',
          placeholder: 'Title'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
          }
        },
        {
          text: 'Save',
          handler: data => {
            let id = 'CloudSoft ' + Uuid.v4();
            this.pouchdbProvider.put({type: "list", title: data.title}, id);
          }
        }
      ]
    });
    prompt.present();
  }


}
