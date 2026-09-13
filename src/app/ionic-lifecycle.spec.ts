/*
 * Reproduccion minima del bloqueo de la migracion a Angular 13.
 *
 * Con Ionic 6 los hooks de ciclo de vida (ionViewWillEnter /
 * ionViewDidEnter) dejaron de dispararse en la app: el rastreo del
 * conductor sale vacio y el del apoderado no abre ninguna suscripcion
 * en tiempo real. Los 23 tests de humo NO lo detectan, porque montan
 * cada pagina con TestBed sin router ni ion-router-outlet, que es
 * justamente quien dispara esos hooks.
 *
 * Esta prueba monta lo minimo que reproduce el caso real: un
 * ion-router-outlet suelto y una pagina dentro de ion-tabs, navega de
 * verdad y comprueba que el hook corre.
 */

import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { IonicModule } from "@ionic/angular";

@Component({ template: "<p>pagina suelta</p>" })
class PaginaSueltaComponent {
  entradas = 0;
  ionViewWillEnter() {
    this.entradas++;
  }
}

@Component({ template: "<p>pagina en tab</p>" })
class PaginaEnTabComponent {
  entradas = 0;
  ionViewWillEnter() {
    this.entradas++;
  }
}

// Replica la estructura de tabs-conductor / tabs-apoderado.
@Component({
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="dentro"></ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
})
class TabsHostComponent {}

@Component({ template: "<ion-router-outlet></ion-router-outlet>" })
class RaizComponent {}

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

describe("Ciclo de vida de Ionic", () => {
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        RaizComponent,
        TabsHostComponent,
        PaginaSueltaComponent,
        PaginaEnTabComponent,
      ],
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule.withRoutes([
          { path: "suelta", component: PaginaSueltaComponent },
          {
            path: "tabs",
            component: TabsHostComponent,
            children: [{ path: "dentro", component: PaginaEnTabComponent }],
          },
        ]),
      ],
    }).compileComponents();
    router = TestBed.inject(Router);
  });

  it("dispara ionViewWillEnter en una pagina dentro de ion-router-outlet", async () => {
    const fixture = TestBed.createComponent(RaizComponent);
    fixture.detectChanges();

    await router.navigateByUrl("/suelta");
    fixture.detectChanges();
    await esperar(400);
    fixture.detectChanges();

    const pagina = fixture.debugElement.query(
      (de) => de.componentInstance instanceof PaginaSueltaComponent
    );
    expect(pagina).withContext("la pagina deberia haberse montado").toBeTruthy();
    expect(pagina.componentInstance.entradas)
      .withContext("ionViewWillEnter no se disparo")
      .toBeGreaterThan(0);
  });

  it("dispara ionViewWillEnter en una pagina dentro de ion-tabs", async () => {
    const fixture = TestBed.createComponent(RaizComponent);
    fixture.detectChanges();

    await router.navigateByUrl("/tabs/dentro");
    fixture.detectChanges();
    await esperar(400);
    fixture.detectChanges();

    const pagina = fixture.debugElement.query(
      (de) => de.componentInstance instanceof PaginaEnTabComponent
    );
    expect(pagina).withContext("la pagina deberia haberse montado").toBeTruthy();
    expect(pagina.componentInstance.entradas)
      .withContext("ionViewWillEnter no se disparo")
      .toBeGreaterThan(0);
  });
});

/*
 * Las rutas reales de la app no son directas: cuelgan de ion-tabs con
 * `loadChildren` (modulo perezoso) y pasan por guards asincronos. Estos
 * casos replican esa forma, que es la unica diferencia entre el montaje
 * de arriba (que funciona) y lo que se observo roto en el navegador.
 */

import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { Injectable } from "@angular/core";

import { of } from "rxjs";
import { delay, take } from "rxjs/operators";

@Component({ template: "<p>pagina perezosa</p>" })
class PaginaPerezosaComponent {
  entradas = 0;
  ionViewWillEnter() {
    this.entradas++;
  }
}

@NgModule({
  declarations: [PaginaPerezosaComponent],
  imports: [
    IonicModule,
    RouterModule.forChild([{ path: "", component: PaginaPerezosaComponent }]),
  ],
})
class ModuloPerezoso {}

// Misma forma que IsLoggedGuard: observable que emite una vez, tras un
// tick, y completa.
@Injectable({ providedIn: "root" })
class GuardAsincrono  {
  canActivate() {
    return of(true).pipe(delay(10), take(1));
  }
}

describe("Ciclo de vida de Ionic con rutas como las de la app", () => {
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RaizComponent, TabsHostComponent],
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule.withRoutes([
          {
            path: "tabs",
            component: TabsHostComponent,
            children: [
              {
                path: "dentro",
                canActivate: [GuardAsincrono],
                loadChildren: () => Promise.resolve(ModuloPerezoso),
              },
            ],
          },
        ]),
      ],
    }).compileComponents();
    router = TestBed.inject(Router);
  });

  it("dispara ionViewWillEnter con loadChildren y guard asincrono dentro de ion-tabs", async () => {
    const fixture = TestBed.createComponent(RaizComponent);
    fixture.detectChanges();

    await router.navigateByUrl("/tabs/dentro");
    fixture.detectChanges();
    await esperar(600);
    fixture.detectChanges();

    const pagina = fixture.debugElement.query(
      (de) => de.componentInstance instanceof PaginaPerezosaComponent
    );
    expect(pagina).withContext("la pagina perezosa deberia haberse montado").toBeTruthy();
    expect(pagina.componentInstance.entradas)
      .withContext("ionViewWillEnter no se disparo con ruta perezosa + guard")
      .toBeGreaterThan(0);
  });
});
