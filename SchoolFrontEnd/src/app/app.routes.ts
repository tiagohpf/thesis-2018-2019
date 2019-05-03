import { InvoiceComponent } from './customComponents/print/invoice/invoice.component';
import { PrintLayoutComponent } from './customComponents/print/print-layout/print-layout.component';
import { Routes } from '@angular/router';

// import { PageComponent } from 'foundations-webct-robot/robot/pageComponent/page.component';

import { WctPageComponent } from './components-v2/wct-page/wct-page.component';

export const ROUTES: Routes = [
  {
    path: '',
    component: WctPageComponent,
    data: {
      mock: 'app-home'
    },
    // redirectTo: '/statistics',
    // pathMatch: 'full'
  },
  // -------STUDENTS-----------
  {
    path: 'students',
    component: WctPageComponent,
    data: {
      mock: 'students/student-list',
      breadcrumb: {
        trail: [
          '{{IXS_name}}',
          'Students'
        ]
      }
    }
  },
  {
    path: 'students/create',
    component: WctPageComponent,
    data: {
      mock: 'students/student-create',
      breadcrumb: {
        trail: [
          '{{IXS_name}}',
          'Students',
          'Create'
        ],
        trailRoutes: [
          '/knowledgecenter',
          '/students'
        ]
      }
    }
  },
  {
    path: 'students/:id',
    component: WctPageComponent,
    data: {
      mock: 'students/student-detail',
      navBarMock: 'students/student-sliding-navbar',
      breadcrumb: {
        trail: [
          '{{IXS_name}}',
          'Students',
          '[[id]]'
        ],
        trailRoutes: [
          '/knowledgecenter',
          '/students'
        ]
      }
    }
  },
  {
    path: 'students/:id/programs',
    component: WctPageComponent,
    data: {
      mock: 'students/student-program-list',
      breadcrumb: {
        trail: [
          '{{IXS_name}}',
          'Students',
          '[[id]]',
          'Programs'
        ],
        trailRoutes: [
          '/knowledgecenter',
          '/students',
          '/students/[[id]]']
      }
    }
  },
  {
    path: 'students/:id/program/:programID',
    component: WctPageComponent,
    data: {
      mock: 'programs/program-details',
      navBarMock: 'programs/program-sliding-navbar',
      breadcrumb: {
        trail: [
          '{{IXS_name}}',
          'Students',
          '[[id]]',
          'Programs',
          '[[programID]]'

        ],
        trailRoutes: [
          '/knowledgecenter',
          '/students',
          '/students/[[id]]',
          '/students/[[id]]/programs'
        ]
      }
    }
  },
  {
    path: 'students/:id/dialogs',
    component: WctPageComponent,
    data: {
      mock: 'dialogs/students-dialogs',
      breadcrumb: {
        trail: [
          '{{IXS_name}}',
          'Students',
          '[[id]]',
          'Dialogs'
        ],
        trailRoutes: [
          '/knowledgecenter',
          '/students',
          '/students/[[id]]']
      }
    }
  },
  {
    path: 'students/:id/testSets',
    component: WctPageComponent,
    data: {
      mock: 'students/student-testSets-main',
      breadcrumb: {
        trail: [
          '{{IXS_name}}',
          'Students',
          '[[id]]',
          'TestSets'
        ],
        trailRoutes: [
          '/knowledgecenter',
          '/students',
          '/students/[[id]]']
      }
    }
  },
  {
    path: 'students/:id/statistics',
    component: WctPageComponent,
    data: {
      mock: 'students/student-statistics',
      breadcrumb: {
        trail: [
          '{{IXS_name}}',
          'Students',
          '[[id]]',
          'Statistics'
        ],
        trailRoutes: [
          '/knowledgecenter',
          '/students',
          '/students/[[id]]'
        ]
      }
    }
  },
  {
    path: 'students/:id/plan',
    component: WctPageComponent,
    data: {
      mock: 'students/student-plan',
      breadcrumb: {
        trail: [
          '{{IXS_name}}',
          'Students',
          '[[id]]',
          'Plan'
        ],
        trailRoutes: [
          '/knowledgecenter',
          '/students',
          '/students/[[id]]'
        ]
      }
    }
  },
  {
    path: 'students/:id/fallbacks',
    component: WctPageComponent,
    data: {
      mock: 'students/student-fallbacks',
      breadcrumb: {
        trail: [
          '{{IXS_name}}',
          'Students',
          '[[id]]',
          'Fallbacks'
        ],
        trailRoutes: [
          '/knowledgecenter',
          '/students',
          '/students/[[id]]'
        ]
      }
    }
  },
  {
    path: 'students/student-create-payPlan',
    component: WctPageComponent,
    data: {
      mock: 'students/student-create-payPlan',
      breadcrumb: {
        trail: [
          '{{IXS_name}}',
          'Students',
          'Create Pay Plan'
        ],
        trailRoutes: [
          '/knowledgecenter',
          '/students'
        ]
      }
    }
  },

  // -------SUBSCRIPTION-----------
  {
    path: 'learnMore',
    component: WctPageComponent,
    data: {
      mock: 'subscription/learnMore',
      breadcrumb: {
        trail: [
          '{{IXS_name}}',
          'Knowledge Center'
        ]
      }
    }
  },
  // -------SUBSCRIPTION-----------
  {
    path: 'knowledgecenter',
    component: WctPageComponent,
    data: {
      mock: 'subscription/knowledgecenter',
      breadcrumb: {
        trail: [
          '{{IXS_name}}',
          'Knowledge Center'
        ]
      }
    }
  },
  // ---------PROGRAMS------------
  // {
  //   path: 'knowledgecenter/programs',
  //   component: WctPageComponent,
  //   data: {
  //     mock: 'subscription/subscription-program-list',
  //     breadcrumb: {
  //       trail: [
  //         '{{IXS_name}}',
  //         'Knowledge Center',
  //         'Programs'
  //       ],
  //       trailRoutes: [
  //         '/knowledgecenter',
  //         '/knowledgecenter'
  //       ]
  //     }
  //   }
  // },
  {
    path: 'knowledgecenter/programs/create',
    component: WctPageComponent,
    data: {
      mock: 'programs/program-create',
      breadcrumb: {
        trail: [
          '{{IXS_name}}',
          'Knowledge Center',
          'Programs',
          'Create'
        ],
        trailRoutes: [
          '/knowledgecenter',
          '/knowledgecenter',
          '/knowledgecenter/programs'
        ]
      }
    }
  },
  {
    path: 'knowledgecenter/programs/:programID',
    component: WctPageComponent,
    data: {
      mock: 'programs/program-details',
      navBarMock: 'programs/program-sliding-navbar',
      breadcrumb: {
        trail: [
          '{{IXS_name}}',
          'Knowledge Center',
          'Programs',
          '[[programID]]'
        ],
        trailRoutes: [
          '/knowledgecenter',
          '/knowledgecenter',
          '/knowledgecenter/programs'
        ]
      }
    }
  },
  {
    path: 'knowledgecenter/programs/:programID/designFlow',
    component: WctPageComponent,
    data: {
      mock: 'programs/program-details-designFlow'
    }
  },
  // ---------COURSES------------
  {
    path: 'knowledgecenter/courses',
    component: WctPageComponent,
    data: {
      mock: 'courses/course-list',
      breadcrumb: {
        trail: [
          '{{IXS_name}}',
          'Knowledge Center',
          'Courses'
        ],
        trailRoutes: [
          '/knowledgecenter',
          '/knowledgecenter'
        ]
      }
    }
  },
  {
    path: 'knowledgecenter/courses/:id',
    component: WctPageComponent,
    data: {
      mock: 'courses/course-details',
      breadcrumb: {
        trail: [
          '{{IXS_name}}',
          'Knowledge Center',
          'Courses',
          '[[id]]'
        ],
        trailRoutes: [
          '/knowledgecenter',
          '/knowledgecenter',
          '/knowledgecenter/courses'
        ]
      }
    }
  }
  // -------DIALOGS-----------
  ,
  {
    path: 'dialogs',
    component: WctPageComponent,
    data: {
      mock: 'dialogs/subscription-dialogs',
      breadcrumb: {
        trail: [
          '{{IXS_name}}',
          'Knowledge Center',
          'Dialogs'
        ],
        trailRoutes: [
          '/knowledgecenter',
          '/knowledgecenter'
        ]
      }
    }
  },
  // -------TEST SET-----------
  {
    path: 'testset',
    component: WctPageComponent,
    data: {
      mock: 'testset/testset-list',
      breadcrumb: {
        trail: [
          '{{IXS_name}}',
          'Test Set'
        ]
      }
    }
  },
  {
    path: 'testset/create',
    component: WctPageComponent,
    data: {
      mock: 'testset/testset-create',
      breadcrumb: {
        trail: [
          '{{IXS_name}}',
          'Test Set',
          'Create'
        ],
        trailRoutes: [
          '/testset'
        ]
      }
    }
  },
  {
    /* operação chamada a partir do programs list */
    path: 'testset/edit/:testsetId',
    component: WctPageComponent,
    data: {
      mock: 'testset/program-edit',
      breadcrumb: {
        trail: [
          '{{IXS_name}}',
          'Test Set',
          'Edit'
        ],
        trailRoutes: [
          '/testset'
        ]
      }
    }
  },
  {
    /* operação chamada a partir do program detail */
    path: 'testset/edit/:testsetId/:detail',
    component: WctPageComponent,
    data: {
      mock: 'testset/program-edit',
      breadcrumb: {
        trail: [
          '{{IXS_name}}',
          'Test Set',
          'Edit'
        ],
        trailRoutes: [
          '/testset'
        ]
      }
    }
  },
  {
    path: 'testset/detail/:name/:token',
    component: WctPageComponent,
    data: {
      mock: 'testset/testset-details',
      breadcrumb: {
        trail: [
          '{{IXS_name}}',
          'Test Set'],
        trailRoutes: [
          '/testset'
        ]
      }
    }
  },
  {
    path: 'testset/detail/:name/:token/createbasequestion',
    component: WctPageComponent,
    data: {
      mock: 'testset/testset-create',
      breadcrumb: {
        trail: [
          '{{IXS_name}}',
          'Test Set',
          '[[name]]',
          'New Base Question'
        ],
        trailRoutes: [
          '/testset',
          '/testset/detail/[[name]]/[[token]]'
        ]
      }
    }
  },
  {
    path: 'testset/detail/:name/:token/basequestions/detail/:code/:question',
    component: WctPageComponent,
    data: {
      mock: 'testset/baseQuestions-detail',
      breadcrumb: {
        trail: [
          '{{IXS_name}}',
          'Test Set',
          '[[name]]',
          'Question - [[question]]'
        ],
        trailRoutes: [
          '/testset',
          '/testset/detail/[[name]]/[[token]]'
        ]
      }
    }
  },
  {
    path: 'testset/detail/:name/:token/basequestions/edit/:code/:question',
    component: WctPageComponent,
    data: {
      mock: 'baseQuestions/baseQuestion-edit',
      breadcrumb: {
        trail: [
          '{{IXS_name}}',
          'Test Set',
          '[[name]]',
          'Question - [[question]]'
        ],
        trailRoutes: [
          '/testset',
          '/testset/detail/[[name]]/[[token]]'
        ]
      }
    }
  },
  //**************************SUBSCRIPTION API**************************************//
  {
    path: "subscription_xapi",
    component: WctPageComponent,
    data: {
      mock: "subscriptionApi/subscription_xapi-list",
      breadcrumb: {
        trail: [
          "requests___entityName"
        ]
      }
    }
  },
  {
    path: "subscription_xapi/create",
    component: WctPageComponent,
    data: {
      mock: "subscriptionApi/subscription_xapi-create",
      breadcrumb: {
        trail: [
          "requests___entityName"
        ]
      }
    }
  },
  {
    path: "subscription_xapi/detail/:id",
    component: WctPageComponent,
    data: {
      mock: "subscriptionApi/subscription_xapi-detail",
      breadcrumb: {
        trail: [
          "requests___entityName"
        ]
      }
    }
  },
  {
    path: "integrations",
    component: WctPageComponent,
    data: {
      mock: "integrations/integrations-list",
      breadcrumb: {
        trail: [
          '{{IXS_name}}'
        ]
      }
    }
  },
  {
    path: "integrations/:name",
    component: WctPageComponent,
    data: {
      mock: "integrations/integrations-bridge",
      breadcrumb: {
        trail: [
          '{{IXS_name}}'
        ]
      }
    }
  },
  {
    path: "fullfilments",
    component: WctPageComponent,
    data: {
      mock: "fullfilment/fullfilment-list",
      breadcrumb: {
        trail: [
          '{{IXS_name}}'
        ]
      }
    }
  },
  {
    path: "fullfilments/create",
    component: WctPageComponent,
    data: {
      mock: "fullfilment/fullfilment-create",
      breadcrumb: {
        trail: [
          "requests___entityName"
        ]
      }
    }
  },
  {
    path: "fullfilments/edit/:id",
    component: WctPageComponent,
    data: {
      mock: "fullfilment/fullfilment-edit",
      breadcrumb: {
        trail: [
          "requests___entityName"
        ]
      }
    }
  },
  {
    path: "analytics",
    component: WctPageComponent,
    data: {
      mock: "analytics/analytics-main",
      breadcrumb: {
        trail: [
          '{{IXS_name}}'
        ]
      }
    }
  },
  {
    path: 'print',
    outlet: 'print',
    component: PrintLayoutComponent,
    children: [
      { path: 'invoice/:invoiceIds', component: InvoiceComponent }
    ]
  },
  {
    path: 'students/:studentId/print',
    outlet: 'print',
    component: PrintLayoutComponent,
    children: [
      { path: 'payments/:paymentId', component: InvoiceComponent }
    ]
  },

  {
    path: '**',
    redirectTo: ''
  }
];
