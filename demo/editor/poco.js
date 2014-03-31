var Poco=Poco||{};Poco.mix=function(a,b,c){void 0==c&&(c=!0);for(var d in b)(!a.hasOwnProperty(d)||c)&&(a[d]=b[d]);return a};
!function(a){function b(a){return f.call(c(a)?a:function(){},a,1)}function c(a){return typeof a===i}function d(a,b,c){return function(){var d=this.supr;this.supr=c[k][a];var e=b.apply(this,arguments);return this.supr=d,e}}function e(a,b,e){for(var f in b)b.hasOwnProperty(f)&&(a[f]=c(b[f])&&c(e[k][f])&&j.test(b[f])?d(f,b[f],e):b[f])}function f(a,b){function d(){}function f(){this.initialize?this.initialize.apply(this,arguments):(b||i&&g.apply(this,arguments),j.apply(this,arguments))}d[k]=this[k];var g=this,h=new d,i=c(a),j=i?a:this,l=i?{}:a;return f.methods=function(a){return e(h,a,g),f[k]=h,this},f.methods.call(f,l).prototype.constructor=f,f.extend=arguments.callee,f[k].implement=f.statics=function(a,b){return a="string"==typeof a?function(){var c={};return c[a]=b,c}():a,e(this,a,g),this},f}var g=a||this,h=g.Class,i="function",j=/xyz/.test(function(){})?/\bsupr\b/:/.*/,k="prototype";b.noConflict=function(){return g.Class=h,this},g.Class=b}(Poco);
!function(a){var b=new a.Class({initialize:function(b){var c={pos:null,points:null,invMass:null,angularVel:0,angle:0,vel:[0,0],elasticity:1};a.mix(this,a.mix(c,b||{})),this.pos="number"==typeof this.x&&"number"==typeof this.y?[this.x,this.y]:this.pos,this.matrix=[0,0,0,0,0,0],this.matrixNextFrame=[0,0,0,0,0,0],this.motionBounds=[0,0,0,0,0,0],this.normals=[],this.vCount=this.points.length;for(var d=0;d<this.vCount;d++){var e=this.points[d],f=this.points[(d+1)%this.vCount],g=f[0]-e[0],h=f[1]-e[1],i=Math.sqrt(g*g+h*h);this.normals[d]=[-h/i,g/i]}this.worldSpaceNormals=[],this.worldSpacePoints=[];for(var d=0;d<this.vCount;d++)this.worldSpaceNormals[d]=[0,0],this.worldSpacePoints[d]=[0,0];null==this.invMass&&(this.invMass=this.area()),this.invI=this.invMass>0?1/(1/this.invMass*this.area()/6):0,this.c1=[0,0],this.c0=[0,0],this.type=this instanceof a.Circle?"circle":this instanceof a.Rect?"rect":"polygon"},featurePairJudgement:function(a,b){for(var c,d,e,f,g,h,i,j,k,l,m,n,o,p,q=0;q<this.vCount;q++){f=this.worldSpaceNormals[q],i=-f[0],j=-f[1],g=[i*a.matrix[0]+j*a.matrix[1],i*a.matrix[2]+j*a.matrix[3]],d=-1,e=-1e6;for(var r=0;r<a.vCount;r++)k=a.points[r],h=g[0]*k[0]+g[1]*k[1],h>e&&(e=h,d=r);c=a.worldSpacePoints[d],l=this.worldSpacePoints[q],m=[c[0]-l[0],c[1]-l[1]],l=this.worldSpacePoints[(q+1)%this.vCount],n=[c[0]-l[0],c[1]-l[1]],o=m[0]*f[0]+m[1]*f[1],i=c[0]-this.pos[0],i=c[1]-this.pos[1],p=i*i+j*j,o>0?(this.projectPointOntoEdge([0,0],m,n,0),o=this.c0[0]*this.c0[0]+this.c0[1]*this.c0[1],o<this.world.mostSeparated[0]?this.world.mostSeparated=[o,d,q,b,p]:o==this.world.mostSeparated[0]&&b==this.world.mostSeparated[3]&&p<this.world.mostSeparated[4]&&(this.world.mostSeparated=[o,d,q,b,p])):o>this.world.mostPenetrating[0]?this.world.mostPenetrating=[o,d,q,b,p]:o==this.world.mostPenetrating[0]&&b==this.world.mostPenetrating[3]&&p<this.world.mostPenetrating[4]&&(this.world.mostPenetrating=[o,d,q,b,p])}},projectPointOntoEdge:function(a,b,c,d){var e=[a[0]-b[0],a[1]-b[1]],f=[c[0]-b[0],c[1]-b[1]],g=(f[0]*e[0]+f[1]*e[1])/(f[0]*f[0]+f[1]*f[1]);g>1&&(g=1),0>g&&(g=0),d?this.c1=[b[0]+f[0]*g,b[1]+f[1]*g]:this.c0=[b[0]+f[0]*g,b[1]+f[1]*g]},area:function(){for(var a=function(a,b,c){return(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])},b=0,c=[0,0],d=0;d<this.vCount-1;d++)b+=a(c,this.points[d],this.points[d+1]);return b+=a(c,this.points[this.vCount-1],this.points[0]),Math.abs(b/2)}});a.Polygon=b}(Poco);
!function(a){var b=a.Polygon.extend({initialize:function(a){"number"==typeof a.width&&"number"==typeof a.height&&(a.points=[[-.5*a.width,-.5*a.height],[-.5*a.width,.5*a.height],[.5*a.width,.5*a.height],[.5*a.width,-.5*a.height]]),this.supr(a)}});a.Rect=b}(Poco);
!function(a){var b=a.Polygon.extend({initialize:function(a){if("number"==typeof a.radius){a.sCount=a.sCount||36;for(var b=[],c=0;c<a.sCount;c++){var d=2*c*Math.PI/a.sCount;b.push([a.radius*Math.sin(d),a.radius*Math.cos(d)])}a.points=b}this.supr(a)}});a.Circle=b}(Poco);
!function(a){var b=a.Class(function(){this.a={},this.b={},this.normal=[0,0],this.ra=[0,0],this.rb=[0,0],this.dist=0,this.impulseN=0,this.impulseT=0,this.invDenom=0,this.invDenomTan=0}).methods({set:function(a,b,c,d){var e,f;this.a=a,this.b=b,this.normal=d,c?(e=a.c1,f=b.c1):(e=a.c0,f=b.c0),this.dist=(f[0]-e[0])*d[0]+(f[1]-e[1])*d[1],this.impulseN=0,this.impulseT=0,this.ra=[-(e[1]-a.pos[1]),e[0]-a.pos[0]],this.rb=[-(f[1]-b.pos[1]),f[0]-b.pos[0]];var g=this.ra[0]*d[0]+this.ra[1]*d[1],h=this.rb[0]*d[0]+this.rb[1]*d[1];this.invDenom=1/(a.invMass+b.invMass+g*g*a.invI+h*h*b.invI),g=this.ra[0]*-d[1]+this.ra[1]*d[0],h=this.rb[0]*-d[1]+this.rb[1]*d[0],this.invDenomTan=1/(a.invMass+b.invMass+g*g*a.invI+h*h*b.invI)}});a.Contact=b}(Poco);
!function(a){var b=a.Class(function(b){var c={numIterations:10,kTimeStep:1/60,kGravity:25,kFriction:.3,kAirFriction:.99};a.mix(this,a.mix(c,b||{})),this.objects=[],this.contactsI=0,this.contacts=[],this.mostSeparated=[0,0,0,0,0],this.mostPenetrating=[0,0,0,0,0]}).methods({addObject:function(b){!b instanceof a.Polygon&&console&&console.warn("Not intance of Poco.Polygon"),b.world=this,this.objects.push(b)},step:function(){this.collide(),this.solve(),this.integrate(),this.generateMotionAABB()},collide:function(){var b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r;this.contactsI=0;for(var s=this.objects,t=0,u=s.length;u-1>t;t++)for(var v=s[t],w=t+1;u>w;w++){var x=s[w];if(0!=v.invMass||0!=x.invMass){var y=v.motionBounds,z=x.motionBounds;Math.abs(z[0]-y[0])-(y[2]+z[2])<0&&Math.abs(z[1]-y[1])-(y[3]+z[3])<0&&(this.mostSeparated=[1e9,-1,-1,0,1e9],this.mostPenetrating=[-1e9,-1,-1,0,1e9],v.featurePairJudgement(x,2),x.featurePairJudgement(v,1),this.mostSeparated[0]>0&&0!=this.mostSeparated[3]?(b=this.mostSeparated[2],c=this.mostSeparated[1],d=this.mostSeparated[3]):this.mostPenetrating[0]<=0&&(b=this.mostPenetrating[2],c=this.mostPenetrating[1],d=this.mostPenetrating[3]),1==d?(e=v,f=x):(e=x,f=v),r=f.worldSpaceNormals[b],g=[r[0],r[1]],l=e.worldSpacePoints[(c-1+e.vCount)%e.vCount],m=e.worldSpacePoints[c],n=e.worldSpacePoints[(c+1)%e.vCount],o=[-(m[1]-l[1]),m[0]-l[0]],q=Math.sqrt(o[0]*o[0]+o[1]*o[1]),o[0]/=q,o[1]/=q,p=[-(n[1]-m[1]),n[0]-m[0]],q=Math.sqrt(p[0]*p[0]+p[1]*p[1]),p[0]/=q,p[1]/=q,o[0]*g[0]+o[1]*g[1]<p[0]*g[0]+p[1]*g[1]?(h=l,i=m):(h=m,i=n),j=f.worldSpacePoints[b],k=f.worldSpacePoints[(b+1)%f.vCount],1===d?(v.projectPointOntoEdge(j,h,i,0),v.projectPointOntoEdge(k,h,i,1),x.projectPointOntoEdge(i,j,k,0),x.projectPointOntoEdge(h,j,k,1),g[0]=-g[0],g[1]=-g[1]):(v.projectPointOntoEdge(i,j,k,0),v.projectPointOntoEdge(h,j,k,1),x.projectPointOntoEdge(j,h,i,0),x.projectPointOntoEdge(k,h,i,1)),this.contacts[this.contactsI]||(this.contacts[this.contactsI]=new a.Contact),this.contacts[this.contactsI++].set(v,x,0,g),this.contacts[this.contactsI]||(this.contacts[this.contactsI]=new a.Contact),this.contacts[this.contactsI++].set(v,x,1,g))}}},solve:function(){for(var a=0;a<this.numIterations;a++)for(var b=0;b<this.contactsI;b++){var c=this.contacts[b],d=c.a,e=c.b,f=c.ra,g=c.rb,h=c.normal,i=[e.vel[0]+g[0]*e.angularVel-(d.vel[0]+f[0]*d.angularVel),e.vel[1]+g[1]*e.angularVel-(d.vel[1]+f[1]*d.angularVel)],j=i[0]*h[0]+i[1]*h[1]+c.dist/this.kTimeStep;if(0>j){var k=j*c.invDenom,l=Math.min(k+c.impulseN,0),m=l-c.impulseN,n=h[0]*m,o=h[1]*m;d.vel[0]+=n*d.invMass*d.elasticity,d.vel[1]+=o*d.invMass*d.elasticity,e.vel[0]-=n*e.invMass*e.elasticity,e.vel[1]-=o*e.invMass*e.elasticity,d.angularVel+=(n*f[0]+o*f[1])*d.invI,e.angularVel-=(n*g[0]+o*g[1])*e.invI,c.impulseN=l;var p=Math.abs(c.impulseN)*this.kFriction,q=i[0]*-h[1]+i[1]*h[0];l=Math.min(Math.max(q*c.invDenomTan+c.impulseT,-p),p);var m=l-c.impulseT;n=-h[1]*m,o=h[0]*m,d.vel[0]+=n*d.invMass,d.vel[1]+=o*d.invMass,e.vel[0]-=n*e.invMass,e.vel[1]-=o*e.invMass,d.angularVel+=(n*f[0]+o*f[1])*d.invI,e.angularVel-=(n*g[0]+o*g[1])*e.invI,c.impulseT=l}}},integrate:function(){for(var a,b=this.objects,c=this.kGravity,d=this.kTimeStep,e=this.kAirFriction,f=0;a=b[f++];){a.drag?(a.vel[0]=10*(pointer.X-a.pos[0]),a.vel[1]=10*(pointer.Y-a.pos[1])):(a.vel[0]*=e,a.invMass>0&&(a.vel[1]+=c)),a.pos=[a.pos[0]+a.vel[0]*d,a.pos[1]+a.vel[1]*d],a.angle+=a.angularVel*d;var g=Math.cos(a.angle),h=Math.sin(a.angle);a.matrix=[g,h,-h,g,a.pos[0],a.pos[1]];var i=a.angle+a.angularVel*d,g=Math.cos(i),h=Math.sin(i);a.matrixNextFrame=[g,h,-h,g,a.pos[0]+a.vel[0]*d,a.pos[1]+a.vel[1]*d]}},generateMotionAABB:function(){for(var a,b=this.objects,c=0;a=b[c++];){for(var d,e=[1e6,1e6],f=[-1e6,-1e6],g=a.matrix,h=a.matrixNextFrame,i=0;i<a.vCount;i++)for(var j=a.points[i],k=a.normals[i],l=0;2>l;l++)d=g[l]*j[0]+g[2+l]*j[1]+g[4+l],a.worldSpacePoints[i][l]=d,d<e[l]&&(e[l]=d),d>f[l]&&(f[l]=d),d=h[l]*j[0]+h[2+l]*j[1]+h[4+l],d<e[l]&&(e[l]=d),d>f[l]&&(f[l]=d),d=g[l]*k[0]+g[2+l]*k[1],a.worldSpaceNormals[i][l]=d;a.motionBounds=[.5*(e[0]+f[0]),.5*(e[1]+f[1]),.5*(f[0]-e[0]),.5*(f[1]-e[1])]}}});a.World=b}(Poco);